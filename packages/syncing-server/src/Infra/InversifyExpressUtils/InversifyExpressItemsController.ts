import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost, results } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { Item } from '../../Domain/Item/Item'
import { SyncResponseFactoryResolverInterface } from '../../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../../Domain/UseCase/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../../Domain/UseCase/GetItem/GetItem'
import { SyncItems } from '../../Domain/UseCase/SyncItems'
import { ItemProjection } from '../../Projection/ItemProjection'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { ApiVersion } from '../../Domain/Api/ApiVersion'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

@controller('/items', TYPES.Sync_AuthMiddleware)
export class InversifyExpressItemsController extends BaseHttpController {
  constructor(
    @inject(TYPES.Sync_SyncItems) private syncItems: SyncItems,
    @inject(TYPES.Sync_CheckIntegrity) private checkIntegrity: CheckIntegrity,
    @inject(TYPES.Sync_GetItem) private getItem: GetItem,
    @inject(TYPES.Sync_ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>,
    @inject(TYPES.Sync_SyncResponseFactoryResolver)
    private syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
    @inject(TYPES.Sync_ControllerContainer) private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('sync.items.sync', this.sync.bind(this))
    this.controllerContainer.register('sync.items.check_integrity', this.checkItemsIntegrity.bind(this))
    this.controllerContainer.register('sync.items.get_item', this.getSingleItem.bind(this))
  }

  @httpPost('/sync')
  public async sync(request: Request, response: Response): Promise<results.JsonResult> {
    let itemHashes = []
    if ('items' in request.body) {
      itemHashes = request.body.items
    }

    const syncResult = await this.syncItems.execute({
      userUuid: response.locals.user.uuid,
      itemHashes,
      computeIntegrityHash: request.body.compute_integrity === true,
      syncToken: request.body.sync_token,
      cursorToken: request.body.cursor_token,
      limit: request.body.limit,
      contentType: request.body.content_type,
      apiVersion: request.body.api ?? ApiVersion.v20161215,
      readOnlyAccess: response.locals.readOnlyAccess,
      sessionUuid: response.locals.session ? response.locals.session.uuid : null,
    })

    const syncResponse = await this.syncResponseFactoryResolver
      .resolveSyncResponseFactoryVersion(request.body.api)
      .createResponse(syncResult)

    return this.json(syncResponse)
  }

  @httpPost('/check-integrity')
  public async checkItemsIntegrity(request: Request, response: Response): Promise<results.JsonResult> {
    let integrityPayloads = []
    if ('integrityPayloads' in request.body) {
      integrityPayloads = request.body.integrityPayloads
    }

    const result = await this.checkIntegrity.execute({
      userUuid: response.locals.user.uuid,
      integrityPayloads,
      freeUser: response.locals.freeUser,
    })

    return this.json(result)
  }

  @httpGet('/:uuid')
  public async getSingleItem(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getItem.execute({
      userUuid: response.locals.user.uuid,
      itemUuid: request.params.uuid,
    })

    if (!result.success) {
      return this.notFound()
    }

    return this.json({ item: await this.itemProjector.projectFull(result.item) })
  }
}
