import { TokenEncoderInterface, WebSocketConnectionTokenData } from '@standardnotes/security'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateWebSocketConnectionDTO } from './CreateWebSocketConnectionDTO'
import { CreateWebSocketConnectionResponse } from './CreateWebSocketConnectionResponse'

@injectable()
export class CreateWebSocketConnectionToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.WebSocketConnectionTokenEncoder)
    private tokenEncoder: TokenEncoderInterface<WebSocketConnectionTokenData>,
    @inject(TYPES.WEB_SOCKET_CONNECTION_TOKEN_TTL) private tokenTTL: number,
  ) {}

  async execute(dto: CreateWebSocketConnectionDTO): Promise<CreateWebSocketConnectionResponse> {
    const data: WebSocketConnectionTokenData = {
      userUuid: dto.userUuid,
      sessionUuid: dto.sessionUuid,
    }

    return {
      token: this.tokenEncoder.encodeExpirableToken(data, this.tokenTTL),
    }
  }
}
