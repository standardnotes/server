import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO } from './TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { ItemQuery } from '../../../Item/ItemQuery'
import { TimerInterface } from '@standardnotes/time'

export class TransitionItemsFromPrimaryToSecondaryDatabaseForUser implements UseCaseInterface<void> {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private secondaryItemRepository: ItemRepositoryInterface | null,
    private timer: TimerInterface,
    private logger: Logger,
  ) {}

  async execute(dto: TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO): Promise<Result<void>> {
    if (this.secondaryItemRepository === null) {
      return Result.fail('Secondary item repository is not set')
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const migrationTimeStart = this.timer.getTimestampInMicroseconds()

    const migrationResult = await this.migrateItemsForUser(userUuid)
    if (migrationResult.isFailed()) {
      const cleanupResult = await this.deleteItemsForUser(userUuid, this.secondaryItemRepository)
      if (cleanupResult.isFailed()) {
        this.logger.error(
          `Failed to clean up secondary database items for user ${userUuid.value}: ${cleanupResult.getError()}`,
        )
      }

      return Result.fail(migrationResult.getError())
    }

    const integrityCheckResult = await this.checkIntegrityBetweenPrimaryAndSecondaryDatabase(userUuid)
    if (integrityCheckResult.isFailed()) {
      const cleanupResult = await this.deleteItemsForUser(userUuid, this.secondaryItemRepository)
      if (cleanupResult.isFailed()) {
        this.logger.error(
          `Failed to clean up secondary database items for user ${userUuid.value}: ${cleanupResult.getError()}`,
        )
      }

      return Result.fail(integrityCheckResult.getError())
    }

    const cleanupResult = await this.deleteItemsForUser(userUuid, this.primaryItemRepository)
    if (cleanupResult.isFailed()) {
      this.logger.error(
        `Failed to clean up primary database items for user ${userUuid.value}: ${cleanupResult.getError()}`,
      )
    }

    const migrationTimeEnd = this.timer.getTimestampInMicroseconds()

    const migrationDuration = migrationTimeEnd - migrationTimeStart
    const migrationDurationTimeStructure = this.timer.convertMicrosecondsToTimeStructure(migrationDuration)

    this.logger.info(
      `Transitioned items for user ${userUuid.value} in ${migrationDurationTimeStructure.hours}h ${migrationDurationTimeStructure.minutes}m ${migrationDurationTimeStructure.seconds}s ${migrationDurationTimeStructure.milliseconds}ms`,
    )

    return Result.ok()
  }

  private async migrateItemsForUser(userUuid: Uuid): Promise<Result<void>> {
    try {
      const totalItemsCountForUser = await this.primaryItemRepository.countAll({ userUuid: userUuid.value })
      const pageSize = 1
      const totalPages = totalItemsCountForUser
      let currentPage = 1
      for (currentPage; currentPage <= totalPages; currentPage++) {
        const query: ItemQuery = {
          userUuid: userUuid.value,
          offset: currentPage - 1,
          limit: pageSize,
        }

        const items = await this.primaryItemRepository.findAll(query)

        for (const item of items) {
          await (this.secondaryItemRepository as ItemRepositoryInterface).save(item)
        }
      }

      return Result.ok()
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }

  private async deleteItemsForUser(userUuid: Uuid, itemRepository: ItemRepositoryInterface): Promise<Result<void>> {
    try {
      await itemRepository.deleteByUserUuid(userUuid.value)

      return Result.ok()
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }

  private async checkIntegrityBetweenPrimaryAndSecondaryDatabase(userUuid: Uuid): Promise<Result<boolean>> {
    try {
      const totalItemsCountForUserInPrimary = await this.primaryItemRepository.countAll({ userUuid: userUuid.value })
      const totalItemsCountForUserInSecondary = await (
        this.secondaryItemRepository as ItemRepositoryInterface
      ).countAll({
        userUuid: userUuid.value,
      })

      if (totalItemsCountForUserInPrimary !== totalItemsCountForUserInSecondary) {
        return Result.fail(
          `Total items count for user ${userUuid.value} in primary database (${totalItemsCountForUserInPrimary}) does not match total items count in secondary database (${totalItemsCountForUserInSecondary})`,
        )
      }

      const pageSize = 1
      const totalPages = totalItemsCountForUserInPrimary
      let currentPage = 1
      for (currentPage; currentPage <= totalPages; currentPage++) {
        const query: ItemQuery = {
          userUuid: userUuid.value,
          offset: currentPage - 1,
          limit: pageSize,
        }

        const items = await this.primaryItemRepository.findAll(query)

        for (const item of items) {
          const itemInSecondary = await (this.secondaryItemRepository as ItemRepositoryInterface).findByUuid(item.uuid)
          if (!itemInSecondary) {
            return Result.fail(`Item ${item.uuid.value} not found in secondary database`)
          }

          if (!item.isIdenticalTo(itemInSecondary)) {
            return Result.fail(`Item ${item.uuid.value} is not identical in primary and secondary database`)
          }
        }
      }

      return Result.ok()
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }
}
