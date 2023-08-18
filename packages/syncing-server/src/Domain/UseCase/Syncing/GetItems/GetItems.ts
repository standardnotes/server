import { Result, RoleNameCollection, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Time, TimerInterface } from '@standardnotes/time'

import { Item } from '../../../Item/Item'
import { GetItemsResult } from './GetItemsResult'
import { ItemQuery } from '../../../Item/ItemQuery'
import { ItemTransferCalculatorInterface } from '../../../Item/ItemTransferCalculatorInterface'
import { GetItemsDTO } from './GetItemsDTO'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { ItemRepositoryResolverInterface } from '../../../Item/ItemRepositoryResolverInterface'

export class GetItems implements UseCaseInterface<GetItemsResult> {
  private readonly DEFAULT_ITEMS_LIMIT = 150
  private readonly SYNC_TOKEN_VERSION = 2

  constructor(
    private itemRepositoryResolver: ItemRepositoryResolverInterface,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private contentSizeTransferLimit: number,
    private itemTransferCalculator: ItemTransferCalculatorInterface,
    private timer: TimerInterface,
    private maxItemsSyncLimit: number,
  ) {}

  async execute(dto: GetItemsDTO): Promise<Result<GetItemsResult>> {
    const lastSyncTimeOrError = this.getLastSyncTime(dto)
    if (lastSyncTimeOrError.isFailed()) {
      return Result.fail(lastSyncTimeOrError.getError())
    }
    const lastSyncTime = lastSyncTimeOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const roleNamesOrError = RoleNameCollection.create(dto.roleNames)
    if (roleNamesOrError.isFailed()) {
      return Result.fail(roleNamesOrError.getError())
    }
    const roleNames = roleNamesOrError.getValue()

    const syncTimeComparison = dto.cursorToken ? '>=' : '>'
    const limit = dto.limit === undefined || dto.limit < 1 ? this.DEFAULT_ITEMS_LIMIT : dto.limit
    const upperBoundLimit = limit < this.maxItemsSyncLimit ? limit : this.maxItemsSyncLimit

    const sharedVaultUsers = await this.sharedVaultUserRepository.findByUserUuid(userUuid)
    const userSharedVaultUuids = sharedVaultUsers.map((sharedVaultUser) => sharedVaultUser.props.sharedVaultUuid.value)

    const exclusiveSharedVaultUuids = dto.sharedVaultUuids
      ? dto.sharedVaultUuids.filter((sharedVaultUuid) => userSharedVaultUuids.includes(sharedVaultUuid))
      : undefined

    const itemQuery: ItemQuery = {
      userUuid: userUuid.value,
      lastSyncTime: lastSyncTime ?? undefined,
      syncTimeComparison,
      contentType: dto.contentType,
      deleted: lastSyncTime ? undefined : false,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      limit: upperBoundLimit,
      includeSharedVaultUuids: !dto.sharedVaultUuids ? userSharedVaultUuids : undefined,
      exclusiveSharedVaultUuids,
    }

    const itemRepository = this.itemRepositoryResolver.resolve(roleNames)

    const itemContentSizeDescriptors = await itemRepository.findContentSizeForComputingTransferLimit(itemQuery)
    const itemUuidsToFetch = await this.itemTransferCalculator.computeItemUuidsToFetch(
      itemContentSizeDescriptors,
      this.contentSizeTransferLimit,
    )
    let items: Array<Item> = []
    if (itemUuidsToFetch.length > 0) {
      items = await itemRepository.findAll({
        uuids: itemUuidsToFetch,
        sortBy: 'updated_at_timestamp',
        sortOrder: 'ASC',
      })
    }
    const totalItemsCount = await itemRepository.countAll(itemQuery)

    let cursorToken = undefined
    if (totalItemsCount > upperBoundLimit) {
      const lastSyncTime = items[items.length - 1].props.timestamps.updatedAt / Time.MicrosecondsInASecond
      cursorToken = Buffer.from(`${this.SYNC_TOKEN_VERSION}:${lastSyncTime}`, 'utf-8').toString('base64')
    }

    return Result.ok({
      items,
      cursorToken,
      lastSyncTime,
    })
  }

  private getLastSyncTime(dto: GetItemsDTO): Result<number | null> {
    let token = dto.syncToken
    if (dto.cursorToken !== undefined && dto.cursorToken !== null) {
      token = dto.cursorToken
    }

    if (!token) {
      return Result.ok(null)
    }

    const decodedToken = Buffer.from(token, 'base64').toString('utf-8')

    const tokenParts = decodedToken.split(':')
    const version = tokenParts.shift()

    switch (version) {
      case '1':
        return Result.ok(this.timer.convertStringDateToMicroseconds(tokenParts.join(':')))
      case '2':
        return Result.ok(+tokenParts[0] * Time.MicrosecondsInASecond)
      default:
        return Result.fail('Sync token is missing version part')
    }
  }
}
