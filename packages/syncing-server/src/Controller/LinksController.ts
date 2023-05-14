import { GetUserItemLinksUseCase } from '../Domain/UseCase/Links/GetUserItemLinksUseCase'
import { GetSharedItemUseCase } from '../Domain/UseCase/Links/GetSharedItemUseCase'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { ShareItemUseCase } from '../Domain/UseCase/Links/ShareItemUseCase'
import { CreateSharedFileValetToken } from '../Domain/UseCase/CreateSharedFileValetToken/CreateSharedFileValetToken'
import { ContentType } from '@standardnotes/common'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Item } from '../Domain/Item/Item'
import { ItemProjection } from '../Projection/ItemProjection'
import { GetItem } from '../Domain/UseCase/GetItem/GetItem'

@controller('/links')
export class LinksController extends BaseHttpController {
  constructor(
    @inject(TYPES.ShareItem) private shareItem: ShareItemUseCase,
    @inject(TYPES.GetSharedItem) private getSharedItem: GetSharedItemUseCase,
    @inject(TYPES.GetItem) private getItem: GetItem,
    @inject(TYPES.GetUserItemLinks) private getItemLinks: GetUserItemLinksUseCase,
    @inject(TYPES.CreateSharedFileValetToken) private createSharedFileValetToken: CreateSharedFileValetToken,
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>,
  ) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async share(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const getItemResponse = await this.getItem.execute({
      userUuid: response.locals.user.uuid,
      itemUuid: request.body.itemUuid,
    })

    if (getItemResponse.success === false) {
      return this.notFoundJson()
    }

    if (getItemResponse.item.userUuid !== response.locals.user.uuid) {
      return this.notFoundJson()
    }

    const result = await this.shareItem.execute({
      itemUuid: request.body.itemUuid,
      userUuid: response.locals.user.uuid,
      permissions: request.body.permissions,
      encryptedContentKey: request.body.encryptedContentKey,
      contentType: request.body.contentType,
      fileRemoteIdentifier: request.body.fileRemoteIdentifier,
      duration: request.body.duration,
    })

    if (result.success === false) {
      return this.errorResponse(400, result.message)
    } else {
      return this.json(result)
    }
  }

  @httpGet('/item/:shareToken')
  public async getItemForShareToken(request: Request): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getSharedItem.execute({
      shareToken: request.params.shareToken,
    })

    if (result.success === false) {
      return this.notFoundJson(result.errorTag)
    }

    const item = await this.itemProjector.projectFull(result.item)

    if (result.item.contentType === ContentType.File) {
      if (!result.itemShare.fileRemoteIdentifier) {
        return this.notFoundJson()
      }

      const valetTokenResult = await this.createSharedFileValetToken.execute({
        shareToken: request.params.shareToken,
        sharingUserUuid: result.item.userUuid,
        remoteIdentifier: result.itemShare.fileRemoteIdentifier,
      })

      if (valetTokenResult.success === false) {
        return this.errorResponse(400, 'Failed to create valet token')
      }

      return this.json({
        item,
        itemShare: result.itemShare,
        fileValetToken: valetTokenResult.valetToken,
      })
    }

    return this.json({
      item,
      itemShare: result.itemShare,
    })
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getItemLinksForUser(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getItemLinks.execute({
      userUuid: response.locals.user.uuid,
    })

    if (result.success === false) {
      return this.notFoundJson()
    }

    return this.json(result)
  }

  private errorResponse(status: number, message?: string, tag?: string) {
    return this.json(
      {
        error: { message, tag },
      },
      status,
    )
  }

  private notFoundJson(errorTag?: string): results.JsonResult {
    return this.json(
      {
        error: { message: 'Not found', tag: errorTag },
      },
      404,
    )
  }
}
