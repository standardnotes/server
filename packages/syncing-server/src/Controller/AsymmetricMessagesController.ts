import { Request, Response } from 'express'
import {
  BaseHttpController,
  controller,
  httpPost,
  results,
  httpDelete,
  httpGet,
  httpPatch,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { AsymmetricMessageServiceInterface } from '../Domain/AsymmetricMessage/Service/AsymmetricMessageServiceInterface'
import { AsymmetricMessageProjector } from '../Projection/AsymmetricMessageProjector'

@controller('/asymmetric-messages')
export class AsymmetricMessagesController extends BaseHttpController {
  constructor(
    @inject(TYPES.AsymmetricMessageService) private asymmetricMessageService: AsymmetricMessageServiceInterface,
    @inject(TYPES.AsymmetricMessageProjector) private asymmetricMessageProjector: AsymmetricMessageProjector,
  ) {
    super()
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getAsymmetricMessages(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.asymmetricMessageService.getMessagesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get shared vault messages')
    }

    const projected = result.map((message) => this.asymmetricMessageProjector.projectFull(message))

    return this.json({ messages: projected })
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async createAsymmetricMessage(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.asymmetricMessageService.createMessage({
      senderUuid: response.locals.user.uuid,
      userUuid: request.body.messagee_uuid,
      senderPublicKey: request.body.sender_public_key,
      encryptedMessage: request.body.encrypted_message,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not create message')
    }

    return this.json({ message: this.asymmetricMessageProjector.projectFull(result) })
  }

  @httpPatch('/:messageUuid', TYPES.AuthMiddleware)
  public async updateAsymmetricMessage(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.asymmetricMessageService.updateMessage({
      senderUuid: response.locals.user.uuid,
      messageUuid: request.params.messageUuid,
      senderPublicKey: request.body.sender_public_key,
      encryptedMessage: request.body.encrypted_message,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not update message')
    }

    return this.json({ message: this.asymmetricMessageProjector.projectFull(result) })
  }

  @httpDelete('/inbound', TYPES.AuthMiddleware)
  public async deleteInboundAsymmetricMessages(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    await this.asymmetricMessageService.deleteAllInboundMessages({
      userUuid: response.locals.user.uuid,
    })

    return this.json({ success: true })
  }

  @httpGet('/outbound', TYPES.AuthMiddleware)
  public async getOutboundAsymmetricMessages(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.asymmetricMessageService.getOutboundMessagesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get shared vault messages')
    }

    const projected = result.map((message) => this.asymmetricMessageProjector.projectFull(message))

    return this.json({ messages: projected })
  }

  @httpDelete('/:messageUuid', TYPES.AuthMiddleware)
  public async deleteAsymmetricMessage(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.asymmetricMessageService.deleteMessage({
      originatorUuid: response.locals.user.uuid,
      messageUuid: request.params.messageUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not delete message')
    }

    return this.json({ success: true })
  }

  private errorResponse(status: number, message?: string, tag?: string) {
    return this.json(
      {
        error: { message, tag },
      },
      status,
    )
  }
}
