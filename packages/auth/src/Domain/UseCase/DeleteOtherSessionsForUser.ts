import { inject, injectable } from 'inversify'
import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import TYPES from '../../Bootstrap/Types'
import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { DeleteOtherSessionsForUserDTO } from './DeleteOtherSessionsForUserDTO'

@injectable()
export class DeleteOtherSessionsForUser implements UseCaseInterface<void> {
  constructor(
    @inject(TYPES.Auth_SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.Auth_SessionService) private sessionService: SessionServiceInterface,
  ) {}

  async execute(dto: DeleteOtherSessionsForUserDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const currentSessionUuidOrError = Uuid.create(dto.currentSessionUuid)
    if (currentSessionUuidOrError.isFailed()) {
      return Result.fail(currentSessionUuidOrError.getError())
    }
    const currentSessionUuid = currentSessionUuidOrError.getValue()

    const sessions = await this.sessionRepository.findAllByUserUuid(dto.userUuid)

    if (dto.markAsRevoked) {
      await Promise.all(
        sessions.map(async (session: Session) => {
          if (session.uuid !== currentSessionUuid.value) {
            await this.sessionService.createRevokedSession(session)
          }
        }),
      )
    }

    await this.sessionRepository.deleteAllByUserUuidExceptOne({ userUuid, currentSessionUuid })

    return Result.ok()
  }
}
