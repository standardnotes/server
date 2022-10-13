import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { AddWebSocketsConnectionDTO } from './AddWebSocketsConnectionDTO'
import { AddWebSocketsConnectionResponse } from './AddWebSocketsConnectionResponse'

@injectable()
export class AddWebSocketsConnection implements UseCaseInterface {
  constructor(
    @inject(TYPES.WebSocketsConnectionRepository)
    private webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: AddWebSocketsConnectionDTO): Promise<AddWebSocketsConnectionResponse> {
    this.logger.debug(`Persisting connection ${dto.connectionId} for user ${dto.userUuid}`)

    await this.webSocketsConnectionRepository.saveConnection(dto.userUuid, dto.connectionId)

    return {
      success: true,
    }
  }
}
