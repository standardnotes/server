import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import TYPES from '../../../Bootstrap/Types'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'
import { AddWebSocketsConnectionDTO } from './AddWebSocketsConnectionDTO'

@injectable()
export class AddWebSocketsConnection implements UseCaseInterface<void> {
  constructor(
    @inject(TYPES.WebSocketsConnectionRepository)
    private webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: AddWebSocketsConnectionDTO): Promise<Result<void>> {
    try {
      this.logger.debug(`Persisting connection ${dto.connectionId} for user ${dto.userUuid}`)

      await this.webSocketsConnectionRepository.saveConnection(dto.userUuid, dto.connectionId)

      return Result.ok()
    } catch (error) {
      this.logger.error(
        `Error persisting connection ${dto.connectionId} for user ${dto.userUuid}: ${(error as Error).message}`,
      )

      return Result.fail((error as Error).message)
    }
  }
}
