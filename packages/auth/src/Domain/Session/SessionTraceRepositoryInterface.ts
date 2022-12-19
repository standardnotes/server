import { Uuid } from '@standardnotes/domain-core'

import { SessionTrace } from './SessionTrace'

export interface SessionTraceRepositoryInterface {
  save(sessionTrace: SessionTrace): Promise<void>
  removeExpiredBefore(date: Date): Promise<void>
  findOneByUserUuidAndDate(userUuid: Uuid, date: Date): Promise<SessionTrace | null>
  countByDate(date: Date): Promise<number>
}
