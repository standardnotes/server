import { Result, UseCaseInterface } from '@standardnotes/domain-core'
import { DeleteSessionByTokenDTO } from './DeleteSessionByTokenDTO'
import { GetSessionFromToken } from '../GetSessionFromToken/GetSessionFromToken'
import { SessionRepositoryInterface } from '../../Session/SessionRepositoryInterface'
import { EphemeralSessionRepositoryInterface } from '../../Session/EphemeralSessionRepositoryInterface'
import { Session } from '../../Session/Session'

export class DeleteSessionByToken implements UseCaseInterface<Session> {
  constructor(
    private getSessionFromToken: GetSessionFromToken,
    private sessionRepository: SessionRepositoryInterface,
    private ephemeralSessionRepository: EphemeralSessionRepositoryInterface,
  ) {}

  async execute(dto: DeleteSessionByTokenDTO): Promise<Result<Session>> {
    const resultOrError = await this.getSessionFromToken.execute(dto)
    if (resultOrError.isFailed()) {
      return Result.fail(resultOrError.getError())
    }
    const result = resultOrError.getValue()

    if (result.isEphemeral) {
      await this.ephemeralSessionRepository.deleteOne(result.session.uuid, result.session.userUuid)
    } else {
      await this.sessionRepository.deleteOneByUuid(result.session.uuid)
    }

    return Result.ok(result.session)
  }
}
