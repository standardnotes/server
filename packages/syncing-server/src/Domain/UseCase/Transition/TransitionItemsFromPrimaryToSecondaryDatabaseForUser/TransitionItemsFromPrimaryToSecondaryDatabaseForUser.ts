/* istanbul ignore file */
import { TimerInterface } from '@standardnotes/time'
import { Result, TransitionStatus, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO } from './TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { ItemQuery } from '../../../Item/ItemQuery'
import { TransitionRepositoryInterface } from '../../../Transition/TransitionRepositoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'

export class TransitionItemsFromPrimaryToSecondaryDatabaseForUser implements UseCaseInterface<void> {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private secondaryItemRepository: ItemRepositoryInterface | null,
    private transitionStatusRepository: TransitionRepositoryInterface | null,
    private timer: TimerInterface,
    private logger: Logger,
    private pageSize: number,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: TransitionItemsFromPrimaryToSecondaryDatabaseForUserDTO): Promise<Result<void>> {
    this.logger.info(`[TRANSITION][${dto.userUuid}] Transitioning items`)

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

    if (await this.isAlreadyMigrated(userUuid)) {
      this.logger.info(`[TRANSITION][${userUuid.value}] User already migrated.`)

      await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Verified, dto.timestamp)

      return Result.ok()
    }

    const migrationTimeStart = this.timer.getTimestampInMicroseconds()

    this.logger.info(`[TRANSITION][${dto.userUuid}] Migrating items`)

    const migrationResult = await this.migrateItemsForUser(userUuid, dto.timestamp)
    if (migrationResult.isFailed()) {
      await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Failed, dto.timestamp)

      return Result.fail(migrationResult.getError())
    }

    this.logger.info(`[TRANSITION][${dto.userUuid}] Items migrated`)

    await this.allowForPrimaryDatabaseToCatchUp()

    this.logger.info(`[TRANSITION][${dto.userUuid}] Checking integrity between primary and secondary database`)

    const integrityCheckResult = await this.checkIntegrityBetweenPrimaryAndSecondaryDatabase(userUuid)
    if (integrityCheckResult.isFailed()) {
      await (this.transitionStatusRepository as TransitionRepositoryInterface).setPagingProgress(userUuid.value, 1)
      await (this.transitionStatusRepository as TransitionRepositoryInterface).setIntegrityProgress(userUuid.value, 1)

      await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Failed, dto.timestamp)

      return Result.fail(integrityCheckResult.getError())
    }

    const cleanupResult = await this.deleteItemsForUser(
      userUuid,
      this.secondaryItemRepository as ItemRepositoryInterface,
    )
    if (cleanupResult.isFailed()) {
      await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Failed, dto.timestamp)

      this.logger.error(
        `[TRANSITION][${dto.userUuid}] Failed to clean up secondary database items: ${cleanupResult.getError()}`,
      )
    }

    const migrationTimeEnd = this.timer.getTimestampInMicroseconds()

    const migrationDuration = migrationTimeEnd - migrationTimeStart
    const migrationDurationTimeStructure = this.timer.convertMicrosecondsToTimeStructure(migrationDuration)

    this.logger.info(
      `[TRANSITION][${dto.userUuid}] Transitioned items in ${migrationDurationTimeStructure.hours}h ${migrationDurationTimeStructure.minutes}m ${migrationDurationTimeStructure.seconds}s ${migrationDurationTimeStructure.milliseconds}ms`,
    )

    await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.Verified, dto.timestamp)

    return Result.ok()
  }

  private async allowForPrimaryDatabaseToCatchUp(): Promise<void> {
    const delay = 1_000
    await this.timer.sleep(delay)
  }

  private async migrateItemsForUser(userUuid: Uuid, timestamp: number): Promise<Result<void>> {
    try {
      const initialPage = await (this.transitionStatusRepository as TransitionRepositoryInterface).getPagingProgress(
        userUuid.value,
      )

      this.logger.info(`[TRANSITION][${userUuid.value}] Migrating from page ${initialPage}`)

      const totalItemsCountForUser = await (this.secondaryItemRepository as ItemRepositoryInterface).countAll({
        userUuid: userUuid.value,
      })
      this.logger.info(`[TRANSITION][${userUuid.value}] Total items count for user: ${totalItemsCountForUser}`)
      const totalPages = Math.ceil(totalItemsCountForUser / this.pageSize)
      this.logger.info(`[TRANSITION][${userUuid.value}] Total pages: ${totalPages}`)
      let insertedCount = 0
      let updatedCount = 0
      let newerCount = 0
      let identicalCount = 0
      for (let currentPage = initialPage; currentPage <= totalPages; currentPage++) {
        const isPageInEvery10Percent = currentPage % Math.ceil(totalPages / 10) === 0
        if (isPageInEvery10Percent) {
          this.logger.info(
            `[TRANSITION][${userUuid.value}] Migrating items for user: ${Math.round(
              (currentPage / totalPages) * 100,
            )}% completed`,
          )
          this.logger.info(
            `[TRANSITION][${userUuid.value}] Inserted items count: ${insertedCount}. Newer items count: ${newerCount}. Identical items count: ${identicalCount}. Updated items count: ${updatedCount}`,
          )
          await this.updateTransitionStatus(userUuid, TransitionStatus.STATUSES.InProgress, timestamp)
        }

        await (this.transitionStatusRepository as TransitionRepositoryInterface).setPagingProgress(
          userUuid.value,
          currentPage,
        )

        const query: ItemQuery = {
          userUuid: userUuid.value,
          offset: (currentPage - 1) * this.pageSize,
          limit: this.pageSize,
          sortBy: 'created_at_timestamp',
          sortOrder: 'ASC',
        }

        const items = await (this.secondaryItemRepository as ItemRepositoryInterface).findAll(query)

        for (const item of items) {
          try {
            const itemInPrimary = await this.primaryItemRepository.findByUuid(item.uuid)

            if (!itemInPrimary) {
              await this.primaryItemRepository.insert(item)

              insertedCount++
            } else {
              if (itemInPrimary.props.timestamps.updatedAt > item.props.timestamps.updatedAt) {
                this.logger.info(
                  `[TRANSITION][${userUuid.value}] Item ${item.uuid.value} is older in secondary than item in primary database`,
                )
                newerCount++

                continue
              }
              if (itemInPrimary.isIdenticalTo(item)) {
                identicalCount++

                continue
              }

              await this.primaryItemRepository.update(item)

              updatedCount++
            }
          } catch (error) {
            this.logger.error(
              `[TRANSITION][${userUuid.value}] Errored when saving item ${item.uuid.value} to primary database: ${
                (error as Error).message
              }`,
            )
          }
        }
      }

      this.logger.info(
        `[TRANSITION][${userUuid.value}] Inserted items count: ${insertedCount}. Newer items count: ${newerCount}. Identical items count: ${identicalCount}. Updated items count: ${updatedCount}`,
      )

      return Result.ok()
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }

  private async deleteItemsForUser(userUuid: Uuid, itemRepository: ItemRepositoryInterface): Promise<Result<void>> {
    try {
      this.logger.info(`[TRANSITION][${userUuid.value}] Cleaning up primary database items`)

      await itemRepository.deleteByUserUuidAndNotInSharedVault(userUuid)

      return Result.ok()
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }

  private async checkIntegrityBetweenPrimaryAndSecondaryDatabase(userUuid: Uuid): Promise<Result<boolean>> {
    try {
      const initialPage = await (this.transitionStatusRepository as TransitionRepositoryInterface).getIntegrityProgress(
        userUuid.value,
      )

      this.logger.info(`[TRANSITION][${userUuid.value}] Checking integrity from page ${initialPage}`)

      const totalItemsCountForUserInSecondary = await (
        this.secondaryItemRepository as ItemRepositoryInterface
      ).countAll({
        userUuid: userUuid.value,
      })
      const totalItemsCountForUserInPrimary = await this.primaryItemRepository.countAll({
        userUuid: userUuid.value,
      })

      if (totalItemsCountForUserInPrimary < totalItemsCountForUserInSecondary) {
        return Result.fail(
          `Total items count for user ${userUuid.value} in primary database (${totalItemsCountForUserInPrimary}) does not match total items count in secondary database (${totalItemsCountForUserInSecondary})`,
        )
      }

      const totalPages = Math.ceil(totalItemsCountForUserInPrimary / this.pageSize)
      for (let currentPage = initialPage; currentPage <= totalPages; currentPage++) {
        await (this.transitionStatusRepository as TransitionRepositoryInterface).setIntegrityProgress(
          userUuid.value,
          currentPage,
        )

        const query: ItemQuery = {
          userUuid: userUuid.value,
          offset: (currentPage - 1) * this.pageSize,
          limit: this.pageSize,
          sortBy: 'created_at_timestamp',
          sortOrder: 'ASC',
        }

        const items = await (this.secondaryItemRepository as ItemRepositoryInterface).findAll(query)

        for (const item of items) {
          const itemInPrimary = await this.primaryItemRepository.findByUuid(item.uuid)
          if (!itemInPrimary) {
            return Result.fail(`Item ${item.uuid.value} not found in primary database`)
          }

          if (itemInPrimary.props.timestamps.updatedAt > item.props.timestamps.updatedAt) {
            this.logger.info(
              `[TRANSITION][${userUuid.value}] Integrity check of Item ${item.uuid.value} - is older in secondary than item in primary database`,
            )

            continue
          }

          if (item.isIdenticalTo(itemInPrimary)) {
            continue
          }

          return Result.fail(
            `Item ${
              item.uuid.value
            } is not identical in primary and secondary database. Item in secondary database: ${JSON.stringify(
              item,
            )}, item in primary database: ${JSON.stringify(itemInPrimary)}`,
          )
        }
      }

      return Result.ok()
    } catch (error) {
      return Result.fail((error as Error).message)
    }
  }

  private async updateTransitionStatus(userUuid: Uuid, status: string, timestamp: number): Promise<void> {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createTransitionStatusUpdatedEvent({
        userUuid: userUuid.value,
        status,
        transitionType: 'items',
        transitionTimestamp: timestamp,
      }),
    )
  }

  private async isAlreadyMigrated(userUuid: Uuid): Promise<boolean> {
    const totalItemsCountForUserInSecondary = await (this.secondaryItemRepository as ItemRepositoryInterface).countAll({
      userUuid: userUuid.value,
    })

    if (totalItemsCountForUserInSecondary > 0) {
      this.logger.info(
        `[TRANSITION][${userUuid.value}] User has ${totalItemsCountForUserInSecondary} items in secondary database.`,
      )
    }

    return totalItemsCountForUserInSecondary === 0
  }
}
