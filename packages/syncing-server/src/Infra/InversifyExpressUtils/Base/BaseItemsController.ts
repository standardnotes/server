import { ControllerContainerInterface, MapperInterface, Validator } from '@standardnotes/domain-core'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { HttpStatusCode } from '@standardnotes/responses'

import { Item } from '../../../Domain/Item/Item'
import { SyncResponseFactoryResolverInterface } from '../../../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../../../Domain/UseCase/Syncing/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../../../Domain/UseCase/Syncing/GetItem/GetItem'
import { ApiVersion } from '../../../Domain/Api/ApiVersion'
import { SyncItems } from '../../../Domain/UseCase/Syncing/SyncItems/SyncItems'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'
import { ItemHash } from '../../../Domain/Item/ItemHash'
import { CheckForTrafficAbuse } from '../../../Domain/UseCase/Syncing/CheckForTrafficAbuse/CheckForTrafficAbuse'
import { Metric } from '../../../Domain/Metrics/Metric'
import { Logger } from 'winston'

export class BaseItemsController extends BaseHttpController {
  constructor(
    protected checkForTrafficAbuse: CheckForTrafficAbuse,
    protected syncItems: SyncItems,
    protected checkIntegrity: CheckIntegrity,
    protected getItem: GetItem,
    protected itemHttpMapper: MapperInterface<Item, ItemHttpRepresentation>,
    protected syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
    protected logger: Logger,
    protected strictAbuseProtection: boolean,
    protected itemOperationsAbuseTimeframeLengthInMinutes: number,
    protected itemOperationsAbuseThreshold: number,
    protected payloadSizeAbuseThreshold: number,
    protected payloadSizeAbuseTimeframeLengthInMinutes: number,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('sync.items.sync', this.sync.bind(this))
      this.controllerContainer.register('sync.items.check_integrity', this.checkItemsIntegrity.bind(this))
      this.controllerContainer.register('sync.items.get_item', this.getSingleItem.bind(this))
    }
  }

  async sync(request: Request, response: Response): Promise<results.JsonResult> {
    const checkForItemOperationsAbuseResult = await this.checkForTrafficAbuse.execute({
      metricToCheck: Metric.NAMES.ItemOperation,
      userUuid: response.locals.user.uuid,
      threshold: this.itemOperationsAbuseThreshold,
      timeframeLengthInMinutes: this.itemOperationsAbuseTimeframeLengthInMinutes,
    })
    if (checkForItemOperationsAbuseResult.isFailed()) {
      this.logger.warn(checkForItemOperationsAbuseResult.getError(), {
        userId: response.locals.user.uuid,
      })
      if (this.strictAbuseProtection) {
        return this.json({ error: { message: checkForItemOperationsAbuseResult.getError() } }, 429)
      }
    }

    const checkForPayloadSizeAbuseResult = await this.checkForTrafficAbuse.execute({
      metricToCheck: Metric.NAMES.ContentSizeUtilized,
      userUuid: response.locals.user.uuid,
      threshold: this.payloadSizeAbuseThreshold,
      timeframeLengthInMinutes: this.payloadSizeAbuseTimeframeLengthInMinutes,
    })
    if (checkForPayloadSizeAbuseResult.isFailed()) {
      this.logger.warn(checkForPayloadSizeAbuseResult.getError(), {
        userId: response.locals.user.uuid,
      })

      if (this.strictAbuseProtection) {
        return this.json({ error: { message: checkForPayloadSizeAbuseResult.getError() } }, 429)
      }
    }

    const itemHashes: ItemHash[] = []
    if ('items' in request.body) {
      for (const itemHashInput of request.body.items) {
        const itemHashOrError = ItemHash.create({
          ...itemHashInput,
          user_uuid: response.locals.user.uuid,
          key_system_identifier: itemHashInput.key_system_identifier ?? null,
          shared_vault_uuid: itemHashInput.shared_vault_uuid ?? null,
        })

        if (itemHashOrError.isFailed()) {
          return this.json({ error: { message: itemHashOrError.getError() } }, HttpStatusCode.BadRequest)
        }

        itemHashes.push(itemHashOrError.getValue())
      }
    }

    let sharedVaultUuids: string[] | undefined = undefined
    if ('shared_vault_uuids' in request.body) {
      const sharedVaultUuidsValidation = Validator.isNotEmpty(request.body.shared_vault_uuids)
      if (!sharedVaultUuidsValidation.isFailed()) {
        sharedVaultUuids = request.body.shared_vault_uuids
      }
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
      snjsVersion: <string>request.headers['x-snjs-version'],
      readOnlyAccess: response.locals.readOnlyAccess,
      sessionUuid: response.locals.session ? response.locals.session.uuid : null,
      sharedVaultUuids,
      isFreeUser: response.locals.isFreeUser,
    })
    if (syncResult.isFailed()) {
      return this.json({ error: { message: syncResult.getError() } }, HttpStatusCode.BadRequest)
    }

    const syncResponse = await this.syncResponseFactoryResolver
      .resolveSyncResponseFactoryVersion(request.body.api)
      .createResponse(syncResult.getValue())

    return this.json(syncResponse)
  }

  async checkItemsIntegrity(request: Request, response: Response): Promise<results.JsonResult> {
    let integrityPayloads = []
    if ('integrityPayloads' in request.body) {
      integrityPayloads = request.body.integrityPayloads
    }

    const result = await this.checkIntegrity.execute({
      userUuid: response.locals.user.uuid,
      integrityPayloads,
    })

    if (result.isFailed()) {
      return this.json({ error: { message: result.getError() } }, HttpStatusCode.BadRequest)
    }

    return this.json({
      mismatches: result.getValue(),
    })
  }

  async getSingleItem(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getItem.execute({
      userUuid: response.locals.user.uuid,
      itemUuid: request.params.uuid,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: { message: 'Item not found' },
        },
        404,
      )
    }

    return this.json({ item: this.itemHttpMapper.toProjection(result.getValue()) })
  }
}
