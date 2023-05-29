import { Request, Response } from 'express'
import { inject } from 'inversify'
import { controller, httpGet, httpPost, results } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { Item } from '../../Domain/Item/Item'
import { SyncResponseFactoryResolverInterface } from '../../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../../Domain/UseCase/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../../Domain/UseCase/GetItem/GetItem'
import { SyncItems } from '../../Domain/UseCase/SyncItems'
import { ItemProjection } from '../../Projection/ItemProjection'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { HomeServerItemsController } from './HomeServer/HomeServerItemsController'

@controller('/items', TYPES.Sync_AuthMiddleware)
export class InversifyExpressItemsController extends HomeServerItemsController {
  constructor(
    @inject(TYPES.Sync_SyncItems) override syncItems: SyncItems,
    @inject(TYPES.Sync_CheckIntegrity) override checkIntegrity: CheckIntegrity,
    @inject(TYPES.Sync_GetItem) override getItem: GetItem,
    @inject(TYPES.Sync_ItemProjector) override itemProjector: ProjectorInterface<Item, ItemProjection>,
    @inject(TYPES.Sync_SyncResponseFactoryResolver)
    override syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
  ) {
    super(syncItems, checkIntegrity, getItem, itemProjector, syncResponseFactoryResolver)
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
  override async getSingleItem(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    return super.getSingleItem(request, response)
  }
}
