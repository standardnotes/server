import { Request, Response } from 'express'
import { inject } from 'inversify'
import { controller, httpGet, httpPost, results } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { Item } from '../../Domain/Item/Item'
import { SyncResponseFactoryResolverInterface } from '../../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../../Domain/UseCase/Syncing/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../../Domain/UseCase/Syncing/GetItem/GetItem'
import { SyncItems } from '../../Domain/UseCase/Syncing/SyncItems/SyncItems'
import { BaseItemsController } from './Base/BaseItemsController'
import { MapperInterface } from '@standardnotes/domain-core'
import { ItemHttpRepresentation } from '../../Mapping/Http/ItemHttpRepresentation'
import { CheckForTrafficAbuse } from '../../Domain/UseCase/Syncing/CheckForTrafficAbuse/CheckForTrafficAbuse'
import { Logger } from 'winston'

@controller('/items', TYPES.Sync_AuthMiddleware)
export class AnnotatedItemsController extends BaseItemsController {
  constructor(
    @inject(TYPES.Sync_CheckForTrafficAbuse) override checkForTrafficAbuse: CheckForTrafficAbuse,
    @inject(TYPES.Sync_SyncItems) override syncItems: SyncItems,
    @inject(TYPES.Sync_CheckIntegrity) override checkIntegrity: CheckIntegrity,
    @inject(TYPES.Sync_GetItem) override getItem: GetItem,
    @inject(TYPES.Sync_ItemHttpMapper) override itemHttpMapper: MapperInterface<Item, ItemHttpRepresentation>,
    @inject(TYPES.Sync_SyncResponseFactoryResolver)
    override syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
    @inject(TYPES.Sync_Logger) override logger: Logger,
    @inject(TYPES.Sync_STRICT_ABUSE_PROTECTION) override strictAbuseProtection: boolean,
    @inject(TYPES.Sync_ITEM_OPERATIONS_ABUSE_TIMEFRAME_LENGTH_IN_MINUTES)
    override itemOperationsAbuseTimeframeLengthInMinutes: number,
    @inject(TYPES.Sync_ITEM_OPERATIONS_ABUSE_THRESHOLD) override itemOperationsAbuseThreshold: number,
    @inject(TYPES.Sync_FREE_USERS_ITEM_OPERATIONS_ABUSE_THRESHOLD)
    override freeUsersItemOperationsAbuseThreshold: number,
    @inject(TYPES.Sync_UPLOAD_BANDWIDTH_ABUSE_THRESHOLD) override payloadSizeAbuseThreshold: number,
    @inject(TYPES.Sync_FREE_USERS_UPLOAD_BANDWIDTH_ABUSE_THRESHOLD) override freeUsersPayloadSizeAbuseThreshold: number,
    @inject(TYPES.Sync_UPLOAD_BANDWIDTH_ABUSE_TIMEFRAME_LENGTH_IN_MINUTES)
    override payloadSizeAbuseTimeframeLengthInMinutes: number,
  ) {
    super(
      checkForTrafficAbuse,
      syncItems,
      checkIntegrity,
      getItem,
      itemHttpMapper,
      syncResponseFactoryResolver,
      logger,
      strictAbuseProtection,
      itemOperationsAbuseTimeframeLengthInMinutes,
      itemOperationsAbuseThreshold,
      freeUsersItemOperationsAbuseThreshold,
      payloadSizeAbuseThreshold,
      freeUsersPayloadSizeAbuseThreshold,
      payloadSizeAbuseTimeframeLengthInMinutes,
    )
  }

  @httpPost('/sync')
  override async sync(request: Request, response: Response): Promise<results.JsonResult> {
    return super.sync(request, response)
  }

  @httpPost('/check-integrity')
  override async checkItemsIntegrity(request: Request, response: Response): Promise<results.JsonResult> {
    return super.checkItemsIntegrity(request, response)
  }

  @httpGet('/:uuid')
  override async getSingleItem(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSingleItem(request, response)
  }
}
