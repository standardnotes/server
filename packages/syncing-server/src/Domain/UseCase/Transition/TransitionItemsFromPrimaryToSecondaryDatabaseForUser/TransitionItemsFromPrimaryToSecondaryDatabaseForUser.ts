/* istanbul ignore file */
import { TimerInterface } from '@standardnotes/time'
import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO } from './TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { ItemQuery } from '../../../Item/ItemQuery'
import { TransitionRepositoryInterface } from '../../../Transition/TransitionRepositoryInterface'

export class TransitionItemsFromPrimaryToSecondaryDatabaseForUser implements UseCaseInterface<void> {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private secondaryItemRepository: ItemRepositoryInterface | null,
    private transitionStatusRepository: TransitionRepositoryInterface | null,
    private timer: TimerInterface,
    private logger: Logger,
    private pageSize: number,
  ) {}

  async execute(dto: TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO): Promise<Result<void>> {
    this.logger.info(`[${dto.userUuid}] Transitioning items`)

    if (this.secondaryItemRepository === null) {
      return Result.fail('Secondary item repository is not set')
    }

    if (this.transitionStatusRepository === null) {
      return Result.fail('Transition status repository is not set')
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const migrationTimeStart = this.timer.getTimestampInMicroseconds()

    this.logger.info(`[${dto.userUuid}] Migrating items`)

    const migrationResult = await this.migrateItemsForUser(userUuid)
    if (migrationResult.isFailed()) {
      return Result.fail(migrationResult.getError())
    }
    const itemsToSkipInIntegrityCheck = migrationResult.getValue()

    this.logger.info(`[${dto.userUuid}] Items migrated`)

    await this.allowForSecondaryDatabaseToCatchUp()

    this.logger.info(`[${dto.userUuid}] Checking integrity between primary and secondary database`)

    const integrityCheckResult = await this.checkIntegrityBetweenPrimaryAndSecondaryDatabase(
      userUuid,
      itemsToSkipInIntegrityCheck,
    )
    if (integrityCheckResult.isFailed()) {
      return Result.fail(integrityCheckResult.getError())
    }

    const cleanupResult = await this.deleteItemsForUser(userUuid, this.primaryItemRepository)
    if (cleanupResult.isFailed()) {
      this.logger.error(`[${dto.userUuid}] Failed to clean up primary database items: ${cleanupResult.getError()}`)
    }

    const migrationTimeEnd = this.timer.getTimestampInMicroseconds()

    const migrationDuration = migrationTimeEnd - migrationTimeStart
    const migrationDurationTimeStructure = this.timer.convertMicrosecondsToTimeStructure(migrationDuration)

    this.logger.info(
      `[${dto.userUuid}] Transitioned items in ${migrationDurationTimeStructure.hours}h ${migrationDurationTimeStructure.minutes}m ${migrationDurationTimeStructure.seconds}s ${migrationDurationTimeStructure.milliseconds}ms`,
    )

    return Result.ok()
  }

  private async allowForSecondaryDatabaseToCatchUp(): Promise<void> {
    const twoSecondsInMilliseconds = 2_000
    await this.timer.sleep(twoSecondsInMilliseconds)
  }

  private async migrateItemsForUser(userUuid: Uuid): Promise<Result<string[]>> {
    try {
      const initialPage = await (this.transitionStatusRepository as TransitionRepositoryInterface).getPagingProgress(
        userUuid.value,
      )

      this.logger.info(`[${userUuid.value}] Migrating from page ${initialPage}`)

      const totalItemsCountForUser = await this.primaryItemRepository.countAll({ userUuid: userUuid.value })
      const totalPages = Math.ceil(totalItemsCountForUser / this.pageSize)
      const itemsToSkipInIntegrityCheck = []
      for (let currentPage = initialPage; currentPage <= totalPages; currentPage++) {
        await (this.transitionStatusRepository as TransitionRepositoryInterface).setPagingProgress(
          userUuid.value,
          currentPage,
        )

        const query: ItemQuery = {
          userUuid: userUuid.value,
          offset: (currentPage - 1) * this.pageSize,
          limit: this.pageSize,
          sortBy: 'uuid',
          sortOrder: 'ASC',
        }

        const items = await this.primaryItemRepository.findAll(query)

        for (const item of items) {
          try {
            const itemInSecondary = await (this.secondaryItemRepository as ItemRepositoryInterface).findByUuid(
              item.uuid,
            )

            if (itemInSecondary !== null) {
              if (itemInSecondary.isIdenticalTo(item)) {
                continue
              }
              if (itemInSecondary.props.timestamps.updatedAt > item.props.timestamps.updatedAt) {
                this.logger.info(`[${userUuid.value}] Item ${item.uuid.value} is older than item in secondary database`)
                itemsToSkipInIntegrityCheck.push(item.uuid.value)

                continue
              }

              this.logger.info(
                `[${userUuid.value}] Removing item ${item.uuid.value} in secondary database as it is not identical to item in primary database`,
              )

              await (this.secondaryItemRepository as ItemRepositoryInterface).removeByUuid(item.uuid)

              await this.allowForSecondaryDatabaseToCatchUp()
            }

            await (this.secondaryItemRepository as ItemRepositoryInterface).save(item)
          } catch (error) {
            this.logger.error(
              `Errored when saving item ${item.uuid.value} to secondary database: ${(error as Error).message}`,
            )
          }
        }
      }

      return Result.ok(itemsToSkipInIntegrityCheck)
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }

  private async deleteItemsForUser(userUuid: Uuid, itemRepository: ItemRepositoryInterface): Promise<Result<void>> {
    try {
      this.logger.info(`[${userUuid.value}] Cleaning up primary database items`)

      await itemRepository.deleteByUserUuidAndNotInSharedVault(userUuid)

      return Result.ok()
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }

  private async checkIntegrityBetweenPrimaryAndSecondaryDatabase(
    userUuid: Uuid,
    itemsToSkipInIntegrityCheck: string[],
  ): Promise<Result<boolean>> {
    try {
      const totalItemsCountForUserInPrimary = await this.primaryItemRepository.countAll({ userUuid: userUuid.value })
      const totalItemsCountForUserInSecondary = await (
        this.secondaryItemRepository as ItemRepositoryInterface
      ).countAll({
        userUuid: userUuid.value,
      })

      if (totalItemsCountForUserInPrimary > totalItemsCountForUserInSecondary) {
        return Result.fail(
          `Total items count for user ${userUuid.value} in primary database (${totalItemsCountForUserInPrimary}) does not match total items count in secondary database (${totalItemsCountForUserInSecondary})`,
        )
      }

      const totalPages = Math.ceil(totalItemsCountForUserInPrimary / this.pageSize)
      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const query: ItemQuery = {
          userUuid: userUuid.value,
          offset: (currentPage - 1) * this.pageSize,
          limit: this.pageSize,
          sortBy: 'uuid',
          sortOrder: 'ASC',
        }

        const items = await this.primaryItemRepository.findAll(query)

        for (const item of items) {
          const itemInSecondary = await (this.secondaryItemRepository as ItemRepositoryInterface).findByUuid(item.uuid)
          if (!itemInSecondary) {
            return Result.fail(`Item ${item.uuid.value} not found in secondary database`)
          }

          if (itemsToSkipInIntegrityCheck.includes(item.id.toString())) {
            continue
          }

          if (!item.isIdenticalTo(itemInSecondary)) {
            return Result.fail(
              `Item ${
                item.uuid.value
              } is not identical in primary and secondary database. Item in primary database: ${JSON.stringify(
                item,
              )}, item in secondary database: ${JSON.stringify(itemInSecondary)}`,
            )
          }
        }
      }

      return Result.ok()
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }
}
