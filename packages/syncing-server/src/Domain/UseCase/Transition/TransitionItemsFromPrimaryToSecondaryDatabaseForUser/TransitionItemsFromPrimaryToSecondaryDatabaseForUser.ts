/* istanbul ignore file */
import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO } from './TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { ItemQuery } from '../../../Item/ItemQuery'
import { TimerInterface } from '@standardnotes/time'
import { Item } from '../../../Item/Item'

export class TransitionItemsFromPrimaryToSecondaryDatabaseForUser implements UseCaseInterface<void> {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private secondaryItemRepository: ItemRepositoryInterface | null,
    private timer: TimerInterface,
    private logger: Logger,
    private pageSize: number,
  ) {}

  async execute(dto: TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO): Promise<Result<void>> {
    this.logger.info(`Transitioning items for user ${dto.userUuid}`)

    if (this.secondaryItemRepository === null) {
      return Result.fail('Secondary item repository is not set')
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    let newItemsInSecondaryCount = 0
    let updatedItemsInSecondary: string[] = []
    if (await this.hasAlreadyDataInSecondaryDatabase(userUuid)) {
      const { alreadyExistingInPrimary, newItemsInSecondary, updatedInSecondary } =
        await this.getNewItemsCreatedInSecondaryDatabase(userUuid)

      for (const existingItemUuid of alreadyExistingInPrimary) {
        this.logger.info(`Removing item ${existingItemUuid} from secondary database`)
        await (this.secondaryItemRepository as ItemRepositoryInterface).removeByUuid(
          Uuid.create(existingItemUuid).getValue(),
        )
      }

      if (newItemsInSecondary.length > 0) {
        this.logger.info(
          `Found ${newItemsInSecondary.length} new items in secondary database for user ${userUuid.value}`,
        )
      }

      newItemsInSecondaryCount = newItemsInSecondary.length

      if (updatedInSecondary.length > 0) {
        this.logger.info(
          `Found ${updatedInSecondary.length} updated items in secondary database for user ${userUuid.value}`,
        )
      }

      updatedItemsInSecondary = updatedInSecondary
    }
    const updatedItemsInSecondaryCount = updatedItemsInSecondary.length

    await this.allowForSecondaryDatabaseToCatchUp()

    const migrationTimeStart = this.timer.getTimestampInMicroseconds()

    const migrationResult = await this.migrateItemsForUser(userUuid, updatedItemsInSecondary)
    if (migrationResult.isFailed()) {
      if (newItemsInSecondaryCount === 0 && updatedItemsInSecondaryCount === 0) {
        const cleanupResult = await this.deleteItemsForUser(userUuid, this.secondaryItemRepository)
        if (cleanupResult.isFailed()) {
          this.logger.error(
            `Failed to clean up secondary database items for user ${userUuid.value}: ${cleanupResult.getError()}`,
          )
        }
      }

      return Result.fail(migrationResult.getError())
    }

    await this.allowForSecondaryDatabaseToCatchUp()

    const integrityCheckResult = await this.checkIntegrityBetweenPrimaryAndSecondaryDatabase(
      userUuid,
      newItemsInSecondaryCount,
      updatedItemsInSecondary,
    )
    if (integrityCheckResult.isFailed()) {
      if (newItemsInSecondaryCount === 0 && updatedItemsInSecondaryCount === 0) {
        const cleanupResult = await this.deleteItemsForUser(userUuid, this.secondaryItemRepository)
        if (cleanupResult.isFailed()) {
          this.logger.error(
            `Failed to clean up secondary database items for user ${userUuid.value}: ${cleanupResult.getError()}`,
          )
        }
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

  private async hasAlreadyDataInSecondaryDatabase(userUuid: Uuid): Promise<boolean> {
    const totalItemsCountForUser = await (this.secondaryItemRepository as ItemRepositoryInterface).countAll({
      userUuid: userUuid.value,
    })

    const hasAlreadyDataInSecondaryDatabase = totalItemsCountForUser > 0
    if (hasAlreadyDataInSecondaryDatabase) {
      this.logger.info(`User ${userUuid.value} has already ${totalItemsCountForUser} items in secondary database`)
    }

    return hasAlreadyDataInSecondaryDatabase
  }

  private async allowForSecondaryDatabaseToCatchUp(): Promise<void> {
    const twoSecondsInMilliseconds = 2_000
    await this.timer.sleep(twoSecondsInMilliseconds)
  }

  private async getNewItemsCreatedInSecondaryDatabase(userUuid: Uuid): Promise<{
    alreadyExistingInPrimary: string[]
    newItemsInSecondary: string[]
    updatedInSecondary: string[]
  }> {
    const alreadyExistingInPrimary: string[] = []
    const updatedInSecondary: string[] = []
    const newItemsInSecondary: string[] = []

    const totalItemsCountForUser = await this.primaryItemRepository.countAll({ userUuid: userUuid.value })
    const totalPages = Math.ceil(totalItemsCountForUser / this.pageSize)
    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      const query: ItemQuery = {
        userUuid: userUuid.value,
        offset: (currentPage - 1) * this.pageSize,
        limit: this.pageSize,
        sortOrder: 'ASC',
        sortBy: 'uuid',
      }

      const items = await (this.secondaryItemRepository as ItemRepositoryInterface).findAll(query)
      for (const item of items) {
        const { itemInPrimary, newerItemInSecondary } = await this.checkIfItemExistsInPrimaryDatabase(item)
        if (itemInPrimary !== null) {
          alreadyExistingInPrimary.push(item.id.toString())
          continue
        }
        if (newerItemInSecondary !== null) {
          updatedInSecondary.push(newerItemInSecondary.id.toString())
          continue
        }
        if (itemInPrimary === null && newerItemInSecondary === null) {
          newItemsInSecondary.push(item.id.toString())
          continue
        }
      }
    }

    return {
      alreadyExistingInPrimary,
      newItemsInSecondary,
      updatedInSecondary,
    }
  }

  private async checkIfItemExistsInPrimaryDatabase(
    item: Item,
  ): Promise<{ itemInPrimary: Item | null; newerItemInSecondary: Item | null }> {
    const itemInPrimary = await this.primaryItemRepository.findByUuid(item.uuid)

    if (itemInPrimary === null) {
      return { itemInPrimary: null, newerItemInSecondary: null }
    }

    if (!item.isIdenticalTo(itemInPrimary)) {
      this.logger.error(
        `Revision ${item.id.toString()} is not identical in primary and secondary database. Revision in secondary database: ${JSON.stringify(
          item,
        )}, revision in primary database: ${JSON.stringify(itemInPrimary)}`,
      )

      return {
        itemInPrimary: null,
        newerItemInSecondary: item.props.timestamps.updatedAt > itemInPrimary.props.timestamps.updatedAt ? item : null,
      }
    }

    return { itemInPrimary: itemInPrimary, newerItemInSecondary: null }
  }

  private async migrateItemsForUser(userUuid: Uuid, updatedItemsInSecondary: string[]): Promise<Result<void>> {
    try {
      const totalItemsCountForUser = await this.primaryItemRepository.countAll({ userUuid: userUuid.value })
      const totalPages = Math.ceil(totalItemsCountForUser / this.pageSize)
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
          if (updatedItemsInSecondary.find((updatedItemUuid) => item.uuid.value === updatedItemUuid)) {
            this.logger.info(`Skipping saving item ${item.uuid.value} as it was updated in secondary database`)

            continue
          }
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

  private async checkIntegrityBetweenPrimaryAndSecondaryDatabase(
    userUuid: Uuid,
    newItemsInSecondaryCount: number,
    updatedItemsInSecondary: string[],
  ): Promise<Result<boolean>> {
    try {
      const totalItemsCountForUserInPrimary = await this.primaryItemRepository.countAll({ userUuid: userUuid.value })
      const totalItemsCountForUserInSecondary = await (
        this.secondaryItemRepository as ItemRepositoryInterface
      ).countAll({
        userUuid: userUuid.value,
      })

      if (totalItemsCountForUserInPrimary + newItemsInSecondaryCount !== totalItemsCountForUserInSecondary) {
        return Result.fail(
          `Total items count for user ${userUuid.value} in primary database (${totalItemsCountForUserInPrimary} + ${newItemsInSecondaryCount}) does not match total items count in secondary database (${totalItemsCountForUserInSecondary})`,
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

          if (updatedItemsInSecondary.find((updatedItemUuid) => item.uuid.value === updatedItemUuid)) {
            this.logger.info(
              `Skipping integrity check for item ${item.uuid.value} as it was updated in secondary database`,
            )
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
