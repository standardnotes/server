import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { HttpStatusCode } from '@standardnotes/responses'
import { ControllerContainerInterface, MapperInterface } from '@standardnotes/domain-core'
import { GetMessagesSentToUser } from '../../../Domain/UseCase/Messaging/GetMessagesSentToUser/GetMessagesSentToUser'
import { MessageHttpRepresentation } from '../../../Mapping/Http/MessageHttpRepresentation'
import { Message } from '../../../Domain/Message/Message'
import { SendMessageToUser } from '../../../Domain/UseCase/Messaging/SendMessageToUser/SendMessageToUser'
import { DeleteAllMessagesSentToUser } from '../../../Domain/UseCase/Messaging/DeleteAllMessagesSentToUser/DeleteAllMessagesSentToUser'
import { DeleteMessage } from '../../../Domain/UseCase/Messaging/DeleteMessage/DeleteMessage'
import { GetMessagesSentByUser } from '../../../Domain/UseCase/Messaging/GetMessagesSentByUser/GetMessagesSentByUser'

export class BaseMessagesController extends BaseHttpController {
  constructor(
    protected getMessageSentToUserUseCase: GetMessagesSentToUser,
    protected getMessagesSentByUserUseCase: GetMessagesSentByUser,
    protected sendMessageToUserUseCase: SendMessageToUser,
    protected deleteMessagesSentToUserUseCase: DeleteAllMessagesSentToUser,
    protected deleteMessageUseCase: DeleteMessage,
    protected messageHttpMapper: MapperInterface<Message, MessageHttpRepresentation>,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('sync.messages.get-received', this.getMessages.bind(this))
      this.controllerContainer.register('sync.messages.get-sent', this.getMessagesSent.bind(this))
      this.controllerContainer.register('sync.messages.send', this.sendMessage.bind(this))
      this.controllerContainer.register('sync.messages.delete-all', this.deleteMessagesSentToUser.bind(this))
      this.controllerContainer.register('sync.messages.delete', this.deleteMessage.bind(this))
    }
  }

  async getMessages(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getMessageSentToUserUseCase.execute({
      recipientUuid: response.locals.user.uuid,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({
      messages: result.getValue().map((message) => this.messageHttpMapper.toProjection(message)),
    })
  }

  async getMessagesSent(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getMessagesSentByUserUseCase.execute({
      senderUuid: response.locals.user.uuid,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({
      messages: result.getValue().map((message) => this.messageHttpMapper.toProjection(message)),
    })
  }

  async sendMessage(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.sendMessageToUserUseCase.execute({
      senderUuid: response.locals.user.uuid,
      recipientUuid: request.body.recipient_uuid,
      encryptedMessage: request.body.encrypted_message,
      replaceabilityIdentifier: request.body.replaceability_identifier,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({
      message: this.messageHttpMapper.toProjection(result.getValue()),
    })
  }

  async deleteMessagesSentToUser(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.deleteMessagesSentToUserUseCase.execute({
      recipientUuid: response.locals.user.uuid,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({ success: true })
  }

  async deleteMessage(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.deleteMessageUseCase.execute({
      messageUuid: request.params.messageUuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({ success: true })
  }
}
