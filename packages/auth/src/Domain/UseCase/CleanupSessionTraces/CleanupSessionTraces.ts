import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import { SessionTraceRepositoryInterface } from '../../Session/SessionTraceRepositoryInterface'
import { CleanupSessionTracesDTO } from './CleanupSessionTracesDTO'

export class CleanupSessionTraces implements UseCaseInterface<string> {
  constructor(private sessionTracesRepository: SessionTraceRepositoryInterface) {}

  async execute(dto: CleanupSessionTracesDTO): Promise<Result<string>> {
    await this.sessionTracesRepository.removeExpiredBefore(dto.date)

    return Result.ok('Session traces removed')
  }
}
