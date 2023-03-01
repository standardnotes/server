import { HttpStatusCode, HttpResponse } from '@standardnotes/responses'
import {
  WebSocketConnectionTokenRequestParams,
  WebSocketConnectionTokenResponseBody,
  WebSocketServerInterface,
} from '@standardnotes/api'
import { inject, injectable } from 'inversify'

import TYPES from '../Bootstrap/Types'
import { CreateWebSocketConnectionToken } from '../Domain/UseCase/CreateWebSocketConnectionToken/CreateWebSocketConnectionToken'

@injectable()
export class WebSocketsController implements WebSocketServerInterface {
  constructor(
    @inject(TYPES.CreateWebSocketConnectionToken)
    private createWebSocketConnectionToken: CreateWebSocketConnectionToken,
  ) {}

  async createConnectionToken(
    params: WebSocketConnectionTokenRequestParams,
  ): Promise<HttpResponse<WebSocketConnectionTokenResponseBody>> {
    const result = await this.createWebSocketConnectionToken.execute({ userUuid: params.userUuid as string })

    return {
      status: HttpStatusCode.Success,
      data: result,
    }
  }
}
