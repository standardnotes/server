/* istanbul ignore file */
import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'

import { TransitionRevisionsFromPrimaryToSecondaryDatabaseForUserDTO } from './TransitionRevisionsFromPrimaryToSecondaryDatabaseForUserDTO'
import { RevisionRepositoryInterface } from '../../../Revision/RevisionRepositoryInterface'

export class TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser implements UseCaseInterface<void> {
  constructor(
    private primaryRevisionsRepository: RevisionRepositoryInterface,
    private secondRevisionsRepository: RevisionRepositoryInterface | null,
    private timer: TimerInterface,
    private logger: Logger,
    private pageSize: number,
  ) {}

  async execute(dto: TransitionRevisionsFromPrimaryToSecondaryDatabaseForUserDTO): Promise<Result<void>> {
    this.logger.info(`[${dto.userUuid}] Transitioning revisions for user`)

    if (this.secondRevisionsRepository === null) {
      return Result.fail('Secondary revision repository is not set')
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const migrationTimeStart = this.timer.getTimestampInMicroseconds()

    this.logger.info(`[${dto.userUuid}] Migrating revisions`)

    const migrationResult = await this.migrateRevisionsForUser(userUuid)
    if (migrationResult.isFailed()) {
      return Result.fail(migrationResult.getError())
    }
    const revisionsToSkipInIntegrityCheck = migrationResult.getValue()

    this.logger.info(`[${dto.userUuid}] Revisions migrated`)

    await this.allowForSecondaryDatabaseToCatchUp()

    this.logger.info(`[${dto.userUuid}] Checking integrity between primary and secondary database`)

    const integrityCheckResult = await this.checkIntegrityBetweenPrimaryAndSecondaryDatabase(
      userUuid,
      revisionsToSkipInIntegrityCheck,
    )
    if (integrityCheckResult.isFailed()) {
      return Result.fail(integrityCheckResult.getError())
    }

    const cleanupResult = await this.deleteRevisionsForUser(userUuid, this.primaryRevisionsRepository)
    if (cleanupResult.isFailed()) {
      this.logger.error(`[${dto.userUuid}] Failed to clean up primary database revisions: ${cleanupResult.getError()}`)
    }

    const migrationTimeEnd = this.timer.getTimestampInMicroseconds()

    const migrationDuration = migrationTimeEnd - migrationTimeStart
    const migrationDurationTimeStructure = this.timer.convertMicrosecondsToTimeStructure(migrationDuration)

    this.logger.info(
      `[${dto.userUuid}] Transitioned revisions in ${migrationDurationTimeStructure.hours}h ${migrationDurationTimeStructure.minutes}m ${migrationDurationTimeStructure.seconds}s ${migrationDurationTimeStructure.milliseconds}ms`,
    )

    return Result.ok()
  }

  private async migrateRevisionsForUser(userUuid: Uuid): Promise<Result<string[]>> {
    try {
      const totalRevisionsCountForUser = await this.primaryRevisionsRepository.countByUserUuid(userUuid)
      const totalPages = Math.ceil(totalRevisionsCountForUser / this.pageSize)
      const revisionsToSkipInIntegrityCheck = []
      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
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
                revisionsToSkipInIntegrityCheck.push(revision.id.toString())

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

      return Result.ok(revisionsToSkipInIntegrityCheck)
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

  private async checkIntegrityBetweenPrimaryAndSecondaryDatabase(
    userUuid: Uuid,
    revisionsToSkipInIntegrityCheck: string[],
  ): Promise<Result<boolean>> {
    try {
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
      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
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

          if (revisionsToSkipInIntegrityCheck.includes(revision.id.toString())) {
            continue
          }

          if (!revision.isIdenticalTo(revisionInSecondary)) {
            return Result.fail(
              `Revision ${revision.id.toString()} is not identical in primary and secondary database. Revision in primary database: ${JSON.stringify(
                revision,
              )}, revision in secondary database: ${JSON.stringify(revisionInSecondary)}`,
            )
          }
        }
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(
        `Errored when checking integrity between primary and secondary database: ${(error as Error).message}`,
      )
    }
  }
}
