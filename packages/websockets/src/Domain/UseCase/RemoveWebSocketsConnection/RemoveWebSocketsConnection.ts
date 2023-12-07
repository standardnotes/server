import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import TYPES from '../../../Bootstrap/Types'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'
import { RemoveWebSocketsConnectionDTO } from './RemoveWebSocketsConnectionDTO'

@injectable()
export class RemoveWebSocketsConnection implements UseCaseInterface<void> {
  constructor(
    @inject(TYPES.WebSocketsConnectionRepository)
    private webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: RemoveWebSocketsConnectionDTO): Promise<Result<void>> {
    try {
      this.logger.debug(`Removing connection ${dto.connectionId}`)

      await this.webSocketsConnectionRepository.removeConnection(dto.connectionId)

      return Result.ok()
    } catch (error) {
      this.logger.error(`Error removing connection: ${(error as Error).message}`, {
        connectionId: dto.connectionId,
      })

      return Result.fail((error as Error).message)
    }
  }
}
