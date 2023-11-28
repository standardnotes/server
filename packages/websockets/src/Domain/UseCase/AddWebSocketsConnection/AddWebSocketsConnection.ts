import { Logger } from 'winston'
import { Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'
import { AddWebSocketsConnectionDTO } from './AddWebSocketsConnectionDTO'
import { Connection } from '../../Connection/Connection'

export class AddWebSocketsConnection implements UseCaseInterface<void> {
  constructor(
    private webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface,
    private timer: TimerInterface,
    private logger: Logger,
  ) {}

  async execute(dto: AddWebSocketsConnectionDTO): Promise<Result<void>> {
    try {
      this.logger.debug(`Persisting connection ${dto.connectionId} for user ${dto.userUuid}`)

      const userUuidOrError = Uuid.create(dto.userUuid)
      if (userUuidOrError.isFailed()) {
        return Result.fail(userUuidOrError.getError())
      }
      const userUuid = userUuidOrError.getValue()

      const sessionUuidOrError = Uuid.create(dto.sessionUuid)
      if (sessionUuidOrError.isFailed()) {
        return Result.fail(sessionUuidOrError.getError())
      }
      const sessionUuid = sessionUuidOrError.getValue()

      const connectionOrError = Connection.create({
        userUuid,
        sessionUuid,
        connectionId: dto.connectionId,
        timestamps: Timestamps.create(
          this.timer.getTimestampInMicroseconds(),
          this.timer.getTimestampInMicroseconds(),
        ).getValue(),
      })
      /* istanbul ignore next */
      if (connectionOrError.isFailed()) {
        return Result.fail(connectionOrError.getError())
      }
      const connection = connectionOrError.getValue()

      await this.webSocketsConnectionRepository.saveConnection(connection)

      return Result.ok()
    } catch (error) {
      this.logger.error(
        `Error persisting connection ${dto.connectionId} for user ${dto.userUuid}: ${(error as Error).message}`,
      )

      return Result.fail((error as Error).message)
    }
  }
}
