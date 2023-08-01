import { controller, httpDelete, httpGet, httpPost, results } from 'inversify-express-utils'
import { inject } from 'inversify'
import { MapperInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'

import TYPES from '../../Bootstrap/Types'
import { BaseMessagesController } from './Base/BaseMessagesController'
import { GetMessagesSentToUser } from '../../Domain/UseCase/Messaging/GetMessagesSentToUser/GetMessagesSentToUser'
import { DeleteAllMessagesSentToUser } from '../../Domain/UseCase/Messaging/DeleteAllMessagesSentToUser/DeleteAllMessagesSentToUser'
import { DeleteMessage } from '../../Domain/UseCase/Messaging/DeleteMessage/DeleteMessage'
import { SendMessageToUser } from '../../Domain/UseCase/Messaging/SendMessageToUser/SendMessageToUser'
import { MessageHttpRepresentation } from '../../Mapping/Http/MessageHttpRepresentation'
import { Message } from '../../Domain/Message/Message'
import { GetMessagesSentByUser } from '../../Domain/UseCase/Messaging/GetMessagesSentByUser/GetMessagesSentByUser'

@controller('/messages', TYPES.Sync_AuthMiddleware)
export class InversifyExpressMessagesController extends BaseMessagesController {
  constructor(
    @inject(TYPES.Sync_GetMessagesSentToUser) override getMessageSentToUserUseCase: GetMessagesSentToUser,
    @inject(TYPES.Sync_GetMessagesSentByUser) override getMessagesSentByUserUseCase: GetMessagesSentByUser,
    @inject(TYPES.Sync_SendMessageToUser) override sendMessageToUserUseCase: SendMessageToUser,
    @inject(TYPES.Sync_DeleteAllMessagesSentToUser)
    override deleteMessagesSentToUserUseCase: DeleteAllMessagesSentToUser,
    @inject(TYPES.Sync_DeleteMessage) override deleteMessageUseCase: DeleteMessage,
    @inject(TYPES.Sync_MessageHttpMapper)
    override messageHttpMapper: MapperInterface<Message, MessageHttpRepresentation>,
  ) {
    super(
      getMessageSentToUserUseCase,
      getMessagesSentByUserUseCase,
      sendMessageToUserUseCase,
      deleteMessagesSentToUserUseCase,
      deleteMessageUseCase,
      messageHttpMapper,
    )
  }

  @httpGet('/')
  override async getMessages(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.getMessages(_request, response)
  }

  @httpGet('/outbound')
  override async getMessagesSent(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.getMessagesSent(_request, response)
  }

  @httpPost('/')
  override async sendMessage(request: Request, response: Response): Promise<results.JsonResult> {
    return super.sendMessage(request, response)
  }

  @httpDelete('/inbound')
  override async deleteMessagesSentToUser(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteMessagesSentToUser(_request, response)
  }

  @httpDelete('/:messageUuid')
  override async deleteMessage(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteMessage(request, response)
  }
}
