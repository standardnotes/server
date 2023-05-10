import { UpdateSharedItemUseCase } from './../Domain/UseCase/ItemShare/UpdateSharedItemUseCase'
import { GetSharedItemUseCase } from './../Domain/UseCase/ItemShare/GetSharedItemUseCase'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPatch, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { ShareItemUseCase } from '../Domain/UseCase/ItemShare/ShareItemUseCase'

@controller('/share', TYPES.AuthMiddleware)
export class ItemSharesController extends BaseHttpController {
  constructor(
    @inject(TYPES.ShareItem) private shareItem: ShareItemUseCase,
    @inject(TYPES.GetSharedItem) private getSharedItem: GetSharedItemUseCase,
    @inject(TYPES.UpdateSharedItem) private updateSharedItem: UpdateSharedItemUseCase,
  ) {
    super()
  }

  @httpPost('/')
  public async share(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.shareItem.execute({
      itemUuid: request.body.item_uuid,
      userUuid: response.locals.user.uuid,
      publicKey: request.body.public_key,
      encryptedContentKey: request.body.encrypted_content_key,
      contentType: request.body.content_type,
    })

    return this.json(result)
  }

  @httpPatch('/')
  public async updateSharedItemRequest(request: Request): Promise<results.JsonResult> {
    const result = await this.updateSharedItem.execute({
      shareToken: request.body.share_token,
      encryptedContentKey: request.body.encrypted_content_key,
    })

    return this.json(result)
  }

  @httpGet('/item/:shareToken')
  public async getItemForShareToken(request: Request): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getSharedItem.execute({
      shareToken: request.body.share_token,
    })

    if (result.success === false) {
      return this.notFound()
    }

    return this.json(result.item)
  }

  @httpGet('/')
  public async getItemSharesForUser(request: Request): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getSharedItem.execute({
      shareToken: request.body.share_token,
    })

    if (result.success === false) {
      return this.notFound()
    }

    return this.json(result.item)
  }
}
