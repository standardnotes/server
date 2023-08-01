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

@controller('/items', TYPES.Sync_AuthMiddleware)
export class InversifyExpressItemsController extends BaseItemsController {
  constructor(
    @inject(TYPES.Sync_SyncItems) override syncItems: SyncItems,
    @inject(TYPES.Sync_CheckIntegrity) override checkIntegrity: CheckIntegrity,
    @inject(TYPES.Sync_GetItem) override getItem: GetItem,
    @inject(TYPES.Sync_ItemHttpMapper) override itemHttpMapper: MapperInterface<Item, ItemHttpRepresentation>,
    @inject(TYPES.Sync_SyncResponseFactoryResolver)
    override syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
  ) {
    super(syncItems, checkIntegrity, getItem, itemHttpMapper, syncResponseFactoryResolver)
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
