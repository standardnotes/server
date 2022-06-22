import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { RemoveWebSocketsConnectionDTO } from './RemoveWebSocketsConnectionDTO'
import { RemoveWebSocketsConnectionResponse } from './RemoveWebSocketsConnectionResponse'

@injectable()
export class RemoveWebSocketsConnection implements UseCaseInterface {
  constructor(
    @inject(TYPES.WebSocketsConnectionRepository)
    private webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: RemoveWebSocketsConnectionDTO): Promise<RemoveWebSocketsConnectionResponse> {
    this.logger.debug(`Removing connection ${dto.connectionId}`)

    await this.webSocketsConnectionRepository.removeConnection(dto.connectionId)

    return {
      success: true,
    }
  }
}
