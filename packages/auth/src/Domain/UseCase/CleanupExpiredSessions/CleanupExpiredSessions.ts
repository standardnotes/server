import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import { SessionRepositoryInterface } from '../../Session/SessionRepositoryInterface'

import { CleanupExpiredSessionsDTO } from './CleanupExpiredSessionsDTO'

export class CleanupExpiredSessions implements UseCaseInterface<string> {
  constructor(private sessionTracesRepository: SessionRepositoryInterface) {}

  async execute(dto: CleanupExpiredSessionsDTO): Promise<Result<string>> {
    await this.sessionTracesRepository.removeExpiredBefore(dto.date)

    return Result.ok('Expired sessions removed')
  }
}
