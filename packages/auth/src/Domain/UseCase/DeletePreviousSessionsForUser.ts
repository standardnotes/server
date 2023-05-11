import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { DeletePreviousSessionsForUserDTO } from './DeletePreviousSessionsForUserDTO'
import { DeletePreviousSessionsForUserResponse } from './DeletePreviousSessionsForUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class DeletePreviousSessionsForUser implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.Auth_SessionService) private sessionService: SessionServiceInterface,
  ) {}

  async execute(dto: DeletePreviousSessionsForUserDTO): Promise<DeletePreviousSessionsForUserResponse> {
    const sessions = await this.sessionRepository.findAllByUserUuid(dto.userUuid)

    await Promise.all(
      sessions.map(async (session: Session) => {
        if (session.uuid !== dto.currentSessionUuid) {
          await this.sessionService.createRevokedSession(session)
        }
      }),
    )

    await this.sessionRepository.deleteAllByUserUuid(dto.userUuid, dto.currentSessionUuid)

    return { success: true }
  }
}
