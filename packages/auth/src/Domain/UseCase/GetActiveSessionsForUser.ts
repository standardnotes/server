import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { EphemeralSessionRepositoryInterface } from '../Session/EphemeralSessionRepositoryInterface'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { GetActiveSessionsForUserDTO } from './GetActiveSessionsForUserDTO'
import { GetActiveSessionsForUserResponse } from './GetActiveSessionsForUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class GetActiveSessionsForUser implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.Auth_EphemeralSessionRepository) private ephemeralSessionRepository: EphemeralSessionRepositoryInterface,
  ) {}

  async execute(dto: GetActiveSessionsForUserDTO): Promise<GetActiveSessionsForUserResponse> {
    const ephemeralSessions = await this.ephemeralSessionRepository.findAllByUserUuid(dto.userUuid)
    const sessions = await this.sessionRepository.findAllByRefreshExpirationAndUserUuid(dto.userUuid)

    return {
      sessions: sessions.concat(ephemeralSessions).sort((a, b) => {
        const dateA = a.refreshExpiration instanceof Date ? a.refreshExpiration : new Date(a.refreshExpiration)
        const dateB = b.refreshExpiration instanceof Date ? b.refreshExpiration : new Date(b.refreshExpiration)

        return dateB.getTime() - dateA.getTime()
      }),
    }
  }
}
