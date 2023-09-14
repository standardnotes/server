/* istanbul ignore file */
import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'

import { TransitionRevisionsFromPrimaryToSecondaryDatabaseForUserDTO } from './TransitionRevisionsFromPrimaryToSecondaryDatabaseForUserDTO'
import { RevisionRepositoryInterface } from '../../../Revision/RevisionRepositoryInterface'
import { Revision } from '../../../Revision/Revision'

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

    let newRevisionsInSecondaryCount = 0
    let updatedRevisionsInSecondary: Revision[] = []
    if (await this.hasAlreadyDataInSecondaryDatabase(userUuid)) {
      const { alreadyExistingInPrimary, newRevisionsInSecondary, updatedInSecondary } =
        await this.getNewRevisionsCreatedInSecondaryDatabase(userUuid)

      for (const existingRevision of alreadyExistingInPrimary) {
        this.logger.info(`Removing revision ${existingRevision.id.toString()} from secondary database`)
        await (this.secondRevisionsRepository as RevisionRepositoryInterface).removeOneByUuid(
          Uuid.create(existingRevision.id.toString()).getValue(),
          userUuid,
        )
      }

      if (newRevisionsInSecondary.length > 0) {
        this.logger.info(
          `Found ${newRevisionsInSecondary.length} new revisions in secondary database for user ${userUuid.value}`,
        )
      }

      newRevisionsInSecondaryCount = newRevisionsInSecondary.length

      if (updatedInSecondary.length > 0) {
        this.logger.info(
          `Found ${updatedInSecondary.length} updated revisions in secondary database for user ${userUuid.value}`,
        )
      }

      updatedRevisionsInSecondary = updatedInSecondary
    }

    const updatedRevisionsInSecondaryCount = updatedRevisionsInSecondary.length

    await this.allowForSecondaryDatabaseToCatchUp()

    const migrationTimeStart = this.timer.getTimestampInMicroseconds()

    this.logger.debug(`Transitioning revisions for user ${userUuid.value}`)

    const migrationResult = await this.migrateRevisionsForUser(userUuid, updatedRevisionsInSecondary)
    if (migrationResult.isFailed()) {
      if (newRevisionsInSecondaryCount === 0 && updatedRevisionsInSecondaryCount === 0) {
        const cleanupResult = await this.deleteRevisionsForUser(userUuid, this.secondRevisionsRepository)
        if (cleanupResult.isFailed()) {
          this.logger.error(
            `Failed to clean up secondary database revisions for user ${userUuid.value}: ${cleanupResult.getError()}`,
          )
        }
      }

      return Result.fail(migrationResult.getError())
    }

    await this.allowForSecondaryDatabaseToCatchUp()

    const integrityCheckResult = await this.checkIntegrityBetweenPrimaryAndSecondaryDatabase(
      userUuid,
      newRevisionsInSecondaryCount,
      updatedRevisionsInSecondary,
    )
    if (integrityCheckResult.isFailed()) {
      if (newRevisionsInSecondaryCount === 0 && updatedRevisionsInSecondaryCount === 0) {
        const cleanupResult = await this.deleteRevisionsForUser(userUuid, this.secondRevisionsRepository)
        if (cleanupResult.isFailed()) {
          this.logger.error(
            `Failed to clean up secondary database revisions for user ${userUuid.value}: ${cleanupResult.getError()}`,
          )
        }
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

  private async migrateRevisionsForUser(
    userUuid: Uuid,
    updatedRevisionsInSecondary: Revision[],
  ): Promise<Result<void>> {
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
            if (
              updatedRevisionsInSecondary.find(
                (updatedRevision) => updatedRevision.id.toString() === revision.id.toString(),
              )
            ) {
              this.logger.info(
                `Skipping saving revision ${revision.id.toString()} as it was updated in secondary database`,
              )

              continue
            }

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

    const hasAlreadyDataInSecondaryDatabase = totalRevisionsCountForUserInSecondary > 0
    if (hasAlreadyDataInSecondaryDatabase) {
      this.logger.info(
        `User ${userUuid.value} has already ${totalRevisionsCountForUserInSecondary} revisions in secondary database`,
      )
    }

    return hasAlreadyDataInSecondaryDatabase
  }

  private async getNewRevisionsCreatedInSecondaryDatabase(userUuid: Uuid): Promise<{
    alreadyExistingInPrimary: Revision[]
    newRevisionsInSecondary: Revision[]
    updatedInSecondary: Revision[]
  }> {
    const revisions = await (this.secondRevisionsRepository as RevisionRepositoryInterface).findByUserUuid({
      userUuid: userUuid,
    })

    const alreadyExistingInPrimary: Revision[] = []
    const newRevisionsInSecondary: Revision[] = []
    const updatedInSecondary: Revision[] = []

    for (const revision of revisions) {
      const { revisionInPrimary, newerRevisionInSecondary } =
        await this.checkIfRevisionExistsInPrimaryDatabase(revision)
      if (revisionInPrimary !== null) {
        alreadyExistingInPrimary.push(revision)
        continue
      }
      if (newerRevisionInSecondary !== null) {
        updatedInSecondary.push(newerRevisionInSecondary)
        continue
      }
      if (revisionInPrimary === null && newerRevisionInSecondary === null) {
        newRevisionsInSecondary.push(revision)
        continue
      }
    }

    return {
      alreadyExistingInPrimary: alreadyExistingInPrimary,
      newRevisionsInSecondary: newRevisionsInSecondary,
      updatedInSecondary: updatedInSecondary,
    }
  }

  private async checkIfRevisionExistsInPrimaryDatabase(
    revision: Revision,
  ): Promise<{ revisionInPrimary: Revision | null; newerRevisionInSecondary: Revision | null }> {
    const revisionInPrimary = await this.primaryRevisionsRepository.findOneByUuid(
      Uuid.create(revision.id.toString()).getValue(),
      revision.props.userUuid as Uuid,
      [],
    )

    if (revisionInPrimary === null) {
      return {
        revisionInPrimary: null,
        newerRevisionInSecondary: null,
      }
    }

    if (!revision.isIdenticalTo(revisionInPrimary)) {
      this.logger.error(
        `Revision ${revision.id.toString()} is not identical in primary and secondary database. Revision in secondary database: ${JSON.stringify(
          revision,
        )}, revision in primary database: ${JSON.stringify(revisionInPrimary)}`,
      )

      return {
        revisionInPrimary: null,
        newerRevisionInSecondary:
          revision.props.dates.updatedAt > revisionInPrimary.props.dates.updatedAt ? revision : null,
      }
    }

    return {
      revisionInPrimary: revisionInPrimary,
      newerRevisionInSecondary: null,
    }
  }

  private async checkIntegrityBetweenPrimaryAndSecondaryDatabase(
    userUuid: Uuid,
    newRevisionsInSecondaryCount: number,
    updatedRevisionsInSecondary: Revision[],
  ): Promise<Result<boolean>> {
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

          if (
            updatedRevisionsInSecondary.find(
              (updatedRevision) => updatedRevision.id.toString() === revision.id.toString(),
            )
          ) {
            this.logger.info(
              `Skipping integrity check for revision ${revision.id.toString()} as it was updated in secondary database`,
            )
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

      const totalRevisionsCountForUserInSecondary = await (
        this.secondRevisionsRepository as RevisionRepositoryInterface
      ).countByUserUuid(userUuid)

      if (
        totalRevisionsCountForUserInPrimary + newRevisionsInSecondaryCount !==
        totalRevisionsCountForUserInSecondary
      ) {
        return Result.fail(
          `Total revisions count for user ${userUuid.value} in primary database (${totalRevisionsCountForUserInPrimary} + ${newRevisionsInSecondaryCount}) does not match total revisions count in secondary database (${totalRevisionsCountForUserInSecondary})`,
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
