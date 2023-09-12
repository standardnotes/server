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
    this.logger.info(`Transitioning revisions for user ${dto.userUuid}`)

    if (this.secondRevisionsRepository === null) {
      return Result.fail('Secondary revision repository is not set')
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    if (await this.isAlreadyMigrated(userUuid)) {
      this.logger.info(`Revisions for user ${userUuid.value} are already migrated`)

      return Result.ok()
    }

    if (await this.hasAlreadyDataInSecondaryDatabase(userUuid)) {
      return Result.fail(`Revisions for user ${userUuid.value} already exist in secondary database`)
    }

    const migrationTimeStart = this.timer.getTimestampInMicroseconds()

    this.logger.debug(`Transitioning revisions for user ${userUuid.value}`)

    const migrationResult = await this.migrateRevisionsForUser(userUuid)
    if (migrationResult.isFailed()) {
      const cleanupResult = await this.deleteRevisionsForUser(userUuid, this.secondRevisionsRepository)
      if (cleanupResult.isFailed()) {
        this.logger.error(
          `Failed to clean up secondary database revisions for user ${userUuid.value}: ${cleanupResult.getError()}`,
        )
      }

      return Result.fail(migrationResult.getError())
    }

    await this.allowForSecondaryDatabaseToCatchUp()

    const integrityCheckResult = await this.checkIntegrityBetweenPrimaryAndSecondaryDatabase(userUuid)
    if (integrityCheckResult.isFailed()) {
      const cleanupResult = await this.deleteRevisionsForUser(userUuid, this.secondRevisionsRepository)
      if (cleanupResult.isFailed()) {
        this.logger.error(
          `Failed to clean up secondary database revisions for user ${userUuid.value}: ${cleanupResult.getError()}`,
        )
      }

      return Result.fail(integrityCheckResult.getError())
    }

    const cleanupResult = await this.deleteRevisionsForUser(userUuid, this.primaryRevisionsRepository)
    if (cleanupResult.isFailed()) {
      this.logger.error(
        `Failed to clean up primary database revisions for user ${userUuid.value}: ${cleanupResult.getError()}`,
      )
    }

    const migrationTimeEnd = this.timer.getTimestampInMicroseconds()

    const migrationDuration = migrationTimeEnd - migrationTimeStart
    const migrationDurationTimeStructure = this.timer.convertMicrosecondsToTimeStructure(migrationDuration)

    this.logger.info(
      `Transitioned revisions for user ${userUuid.value} in ${migrationDurationTimeStructure.hours}h ${migrationDurationTimeStructure.minutes}m ${migrationDurationTimeStructure.seconds}s ${migrationDurationTimeStructure.milliseconds}ms`,
    )

    return Result.ok()
  }

  private async migrateRevisionsForUser(userUuid: Uuid): Promise<Result<void>> {
    try {
      const totalRevisionsCountForUser = await this.primaryRevisionsRepository.countByUserUuid(userUuid)
      let totalRevisionsCountTransitionedToSecondary = 0
      const totalPages = Math.ceil(totalRevisionsCountForUser / this.pageSize)
      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const query = {
          userUuid: userUuid,
          offset: (currentPage - 1) * this.pageSize,
          limit: this.pageSize,
        }

        const revisions = await this.primaryRevisionsRepository.findByUserUuid(query)

        for (const revision of revisions) {
          try {
            this.logger.debug(
              `Transitioning revision #${
                totalRevisionsCountTransitionedToSecondary + 1
              }: ${revision.id.toString()} to secondary database`,
            )

            const didSave = await (this.secondRevisionsRepository as RevisionRepositoryInterface).insert(revision)
            if (!didSave) {
              return Result.fail(`Failed to save revision ${revision.id.toString()} to secondary database`)
            }
            totalRevisionsCountTransitionedToSecondary++
          } catch (error) {
            return Result.fail(
              `Errored when saving revision ${revision.id.toString()} to secondary database: ${
                (error as Error).message
              }`,
            )
          }
        }
      }

      this.logger.debug(`Transitioned ${totalRevisionsCountTransitionedToSecondary} revisions to secondary database`)

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

  private async hasAlreadyDataInSecondaryDatabase(userUuid: Uuid): Promise<boolean> {
    const totalRevisionsCountForUserInSecondary = await (
      this.secondRevisionsRepository as RevisionRepositoryInterface
    ).countByUserUuid(userUuid)

    return totalRevisionsCountForUserInSecondary > 0
  }

  private async isAlreadyMigrated(userUuid: Uuid): Promise<boolean> {
    const totalRevisionsCountForUserInPrimary = await this.primaryRevisionsRepository.countByUserUuid(userUuid)

    return totalRevisionsCountForUserInPrimary === 0
  }

  private async checkIntegrityBetweenPrimaryAndSecondaryDatabase(userUuid: Uuid): Promise<Result<boolean>> {
    try {
      const totalRevisionsCountForUserInPrimary = await this.primaryRevisionsRepository.countByUserUuid(userUuid)

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

          if (!revision.isIdenticalTo(revisionInSecondary)) {
            return Result.fail(
              `Revision ${revision.id.toString()} is not identical in primary and secondary database. Revision in primary database: ${JSON.stringify(
                revision,
              )}, revision in secondary database: ${JSON.stringify(revisionInSecondary)}`,
            )
          }
        }
      }

      const totalRevisionsCountForUserInSecondary = await (
        this.secondRevisionsRepository as RevisionRepositoryInterface
      ).countByUserUuid(userUuid)

      if (totalRevisionsCountForUserInPrimary !== totalRevisionsCountForUserInSecondary) {
        return Result.fail(
          `Total revisions count for user ${userUuid.value} in primary database (${totalRevisionsCountForUserInPrimary}) does not match total revisions count in secondary database (${totalRevisionsCountForUserInSecondary})`,
        )
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(
        `Errored when checking integrity between primary and secondary database: ${(error as Error).message}`,
      )
    }
  }
}
