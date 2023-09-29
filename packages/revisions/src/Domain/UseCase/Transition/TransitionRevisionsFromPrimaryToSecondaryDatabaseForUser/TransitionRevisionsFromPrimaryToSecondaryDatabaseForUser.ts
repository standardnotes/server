/* istanbul ignore file */
import { Result, TransitionStatus, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'

import { TransitionRevisionsFromPrimaryToSecondaryDatabaseForUserDTO } from './TransitionRevisionsFromPrimaryToSecondaryDatabaseForUserDTO'
import { RevisionRepositoryInterface } from '../../../Revision/RevisionRepositoryInterface'
import { TransitionRepositoryInterface } from '../../../Transition/TransitionRepositoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'

export class TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser implements UseCaseInterface<void> {
  constructor(
    private primaryRevisionsRepository: RevisionRepositoryInterface,
    private secondRevisionsRepository: RevisionRepositoryInterface | null,
    private transitionStatusRepository: TransitionRepositoryInterface | null,
    private timer: TimerInterface,
    private logger: Logger,
    private pageSize: number,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: TransitionRevisionsFromPrimaryToSecondaryDatabaseForUserDTO): Promise<Result<void>> {
    this.logger.info(`[${dto.userUuid}] Transitioning revisions for user`)

    if (this.secondRevisionsRepository === null) {
      return Result.fail('Secondary revision repository is not set')
    }

    if (this.transitionStatusRepository === null) {
      return Result.fail('Transition status repository is not set')
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    if (await this.isAlreadyMigrated(userUuid)) {
      this.logger.info(`[${userUuid.value}] User already migrated.`)

      await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Verified, dto.timestamp)

      return Result.ok()
    }

    await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.InProgress, dto.timestamp)

    const migrationTimeStart = this.timer.getTimestampInMicroseconds()

    this.logger.info(`[${dto.userUuid}] Migrating revisions`)

    const migrationResult = await this.migrateRevisionsForUser(userUuid, dto.timestamp)
    if (migrationResult.isFailed()) {
      await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Failed, dto.timestamp)

      return Result.fail(migrationResult.getError())
    }

    this.logger.info(`[${dto.userUuid}] Revisions migrated`)

    await this.allowForSecondaryDatabaseToCatchUp()

    this.logger.info(`[${dto.userUuid}] Checking integrity between primary and secondary database`)

    const integrityCheckResult = await this.checkIntegrityBetweenPrimaryAndSecondaryDatabase(userUuid)
    if (integrityCheckResult.isFailed()) {
      await (this.transitionStatusRepository as TransitionRepositoryInterface).setPagingProgress(userUuid.value, 1)
      await (this.transitionStatusRepository as TransitionRepositoryInterface).setIntegrityProgress(userUuid.value, 1)

      await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Failed, dto.timestamp)

      return Result.fail(integrityCheckResult.getError())
    }

    const cleanupResult = await this.deleteRevisionsForUser(userUuid, this.primaryRevisionsRepository)
    if (cleanupResult.isFailed()) {
      await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Failed, dto.timestamp)

      this.logger.error(`[${dto.userUuid}] Failed to clean up primary database revisions: ${cleanupResult.getError()}`)
    }

    const migrationTimeEnd = this.timer.getTimestampInMicroseconds()

    const migrationDuration = migrationTimeEnd - migrationTimeStart
    const migrationDurationTimeStructure = this.timer.convertMicrosecondsToTimeStructure(migrationDuration)

    this.logger.info(
      `[${dto.userUuid}] Transitioned revisions in ${migrationDurationTimeStructure.hours}h ${migrationDurationTimeStructure.minutes}m ${migrationDurationTimeStructure.seconds}s ${migrationDurationTimeStructure.milliseconds}ms`,
    )

    await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Verified, dto.timestamp)

    return Result.ok()
  }

  private async migrateRevisionsForUser(userUuid: Uuid, timestamp: number): Promise<Result<void>> {
    try {
      const initialPage = await (this.transitionStatusRepository as TransitionRepositoryInterface).getPagingProgress(
        userUuid.value,
      )

      this.logger.info(`[${userUuid.value}] Migrating from page ${initialPage}`)

      const totalRevisionsCountForUser = await this.primaryRevisionsRepository.countByUserUuid(userUuid)
      const totalPages = Math.ceil(totalRevisionsCountForUser / this.pageSize)
      for (let currentPage = initialPage; currentPage <= totalPages; currentPage++) {
        const isPageInEvery10Percent = currentPage % Math.ceil(totalPages / 10) === 0
        if (isPageInEvery10Percent) {
          this.logger.info(
            `[${userUuid.value}] Migrating revisions for user: ${Math.round(
              (currentPage / totalPages) * 100,
            )}% completed`,
          )
          await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.InProgress, timestamp)
        }

        await (this.transitionStatusRepository as TransitionRepositoryInterface).setPagingProgress(
          userUuid.value,
          currentPage,
        )

        const query = {
          userUuid: userUuid,
          offset: (currentPage - 1) * this.pageSize,
          limit: this.pageSize,
        }

        const revisions = await this.primaryRevisionsRepository.findByUserUuid(query)
        for (const revision of revisions) {
          try {
            const revisionInSecondary = await (
              this.secondRevisionsRepository as RevisionRepositoryInterface
            ).findOneByUuid(Uuid.create(revision.id.toString()).getValue(), revision.props.userUuid as Uuid, [])

            if (revisionInSecondary !== null) {
              if (revisionInSecondary.isIdenticalTo(revision)) {
                continue
              }
              if (revisionInSecondary.props.dates.updatedAt > revision.props.dates.updatedAt) {
                this.logger.info(
                  `[${userUuid.value}] Revision ${revision.id.toString()} is older than revision in secondary database`,
                )

                continue
              }

              this.logger.info(
                `[${
                  userUuid.value
                }] Removing revision ${revision.id.toString()} in secondary database as it is not identical to revision in primary database`,
              )

              await (this.secondRevisionsRepository as RevisionRepositoryInterface).removeOneByUuid(
                Uuid.create(revisionInSecondary.id.toString()).getValue(),
                revisionInSecondary.props.userUuid as Uuid,
              )
              await this.allowForSecondaryDatabaseToCatchUp()
            }

            const didSave = await (this.secondRevisionsRepository as RevisionRepositoryInterface).insert(revision)
            if (!didSave) {
              this.logger.error(`Failed to save revision ${revision.id.toString()} to secondary database`)
            }
          } catch (error) {
            this.logger.error(
              `Errored when saving revision ${revision.id.toString()} to secondary database: ${
                (error as Error).message
              }`,
            )
          }
        }
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(`Errored when migrating revisions for user ${userUuid.value}: ${(error as Error).message}`)
    }
  }

  private async deleteRevisionsForUser(
    userUuid: Uuid,
    revisionRepository: RevisionRepositoryInterface,
  ): Promise<Result<void>> {
    try {
      this.logger.info(`[${userUuid.value}] Deleting all revisions from primary database`)

      await revisionRepository.removeByUserUuid(userUuid)

      return Result.ok()
    } catch (error) {
      return Result.fail(`Errored when deleting revisions for user ${userUuid.value}: ${(error as Error).message}`)
    }
  }

  private async allowForSecondaryDatabaseToCatchUp(): Promise<void> {
    const twoSecondsInMilliseconds = 2_000
    await this.timer.sleep(twoSecondsInMilliseconds)
  }

  private async checkIntegrityBetweenPrimaryAndSecondaryDatabase(userUuid: Uuid): Promise<Result<boolean>> {
    try {
      const initialPage = await (this.transitionStatusRepository as TransitionRepositoryInterface).getIntegrityProgress(
        userUuid.value,
      )

      this.logger.info(`[${userUuid.value}] Checking integrity from page ${initialPage}`)

      const totalRevisionsCountForUserInPrimary = await this.primaryRevisionsRepository.countByUserUuid(userUuid)
      const totalRevisionsCountForUserInSecondary = await (
        this.secondRevisionsRepository as RevisionRepositoryInterface
      ).countByUserUuid(userUuid)

      if (totalRevisionsCountForUserInPrimary > totalRevisionsCountForUserInSecondary) {
        return Result.fail(
          `Total revisions count for user ${userUuid.value} in primary database (${totalRevisionsCountForUserInPrimary}) does not match total revisions count in secondary database (${totalRevisionsCountForUserInSecondary})`,
        )
      }

      const totalPages = Math.ceil(totalRevisionsCountForUserInPrimary / this.pageSize)
      for (let currentPage = initialPage; currentPage <= totalPages; currentPage++) {
        await (this.transitionStatusRepository as TransitionRepositoryInterface).setIntegrityProgress(
          userUuid.value,
          currentPage,
        )

        const query = {
          userUuid: userUuid,
          offset: (currentPage - 1) * this.pageSize,
          limit: this.pageSize,
        }

        const revisions = await this.primaryRevisionsRepository.findByUserUuid(query)

        for (const revision of revisions) {
          const revisionUuidOrError = Uuid.create(revision.id.toString())
          /* istanbul ignore if */
          if (revisionUuidOrError.isFailed()) {
            return Result.fail(revisionUuidOrError.getError())
          }
          const revisionUuid = revisionUuidOrError.getValue()

          const revisionInSecondary = await (
            this.secondRevisionsRepository as RevisionRepositoryInterface
          ).findOneByUuid(revisionUuid, userUuid, [])
          if (!revisionInSecondary) {
            return Result.fail(`Revision ${revision.id.toString()} not found in secondary database`)
          }

          if (revision.isIdenticalTo(revisionInSecondary)) {
            continue
          }

          if (revisionInSecondary.props.dates.updatedAt > revision.props.dates.updatedAt) {
            this.logger.info(
              `[${
                userUuid.value
              }] Integrity check of revision ${revision.id.toString()} - is older than revision in secondary database`,
            )

            continue
          }

          return Result.fail(
            `Revision ${revision.id.toString()} is not identical in primary and secondary database. Revision in primary database: ${JSON.stringify(
              revision,
            )}, revision in secondary database: ${JSON.stringify(revisionInSecondary)}`,
          )
        }
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(
        `Errored when checking integrity between primary and secondary database: ${(error as Error).message}`,
      )
    }
  }

  private async updateTransitionStatus(userUuid: Uuid, status: string, timestamp: number): Promise<void> {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createTransitionStatusUpdatedEvent({
        userUuid: userUuid.value,
        status,
        transitionType: 'revisions',
        transitionTimestamp: timestamp,
      }),
    )
  }

  private async isAlreadyMigrated(userUuid: Uuid): Promise<boolean> {
    const totalRevisionsCountForUserInPrimary = await this.primaryRevisionsRepository.countByUserUuid(userUuid)

    if (totalRevisionsCountForUserInPrimary > 0) {
      this.logger.info(
        `[${userUuid.value}] User has ${totalRevisionsCountForUserInPrimary} revisions in primary database.`,
      )
    }

    return totalRevisionsCountForUserInPrimary === 0
  }
}
