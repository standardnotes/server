import { GetUserItemSharesUseCase } from './../Domain/UseCase/ItemShare/GetUserItemSharesUseCase'
import { UpdateSharedItemUseCase } from './../Domain/UseCase/ItemShare/UpdateSharedItemUseCase'
import { GetSharedItemUseCase } from './../Domain/UseCase/ItemShare/GetSharedItemUseCase'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPatch, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { ShareItemUseCase } from '../Domain/UseCase/ItemShare/ShareItemUseCase'

@controller('/share')
export class ItemSharesController extends BaseHttpController {
  constructor(
    @inject(TYPES.ShareItem) private shareItem: ShareItemUseCase,
    @inject(TYPES.GetSharedItem) private getSharedItem: GetSharedItemUseCase,
    @inject(TYPES.UpdateSharedItem) private updateSharedItem: UpdateSharedItemUseCase,
    @inject(TYPES.GetUserItemShares) private getItemShares: GetUserItemSharesUseCase,
  ) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async share(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.shareItem.execute({
      itemUuid: request.body.itemUuid,
      userUuid: response.locals.user.uuid,
      publicKey: request.body.publicKey,
      encryptedContentKey: request.body.encryptedContentKey,
      contentType: request.body.contentType,
    })

    return this.json(result)
  }

  @httpPatch('/', TYPES.AuthMiddleware)
  public async updateSharedItemRequest(request: Request): Promise<results.JsonResult> {
    const result = await this.updateSharedItem.execute({
      shareToken: request.body.shareToken,
      encryptedContentKey: request.body.encryptedContentKey,
    })

    return this.json(result)
  }

  @httpGet('/item/:shareToken')
  public async getItemForShareToken(request: Request): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getSharedItem.execute({
      shareToken: request.params.shareToken,
    })

    if (result.success === false) {
      return this.notFound()
    }

    return this.json(result)
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getItemSharesForUser(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getItemShares.execute({
      userUuid: response.locals.user.uuid,
    })

    if (result.success === false) {
      return this.notFound()
    }

    return this.json(result)
  }
}
