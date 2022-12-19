import { Uuid } from '@standardnotes/domain-core'

import { SessionTrace } from './SessionTrace'

export interface SessionTraceRepositoryInterface {
  save(sessionTrace: SessionTrace): Promise<void>
  findOneByUserUuidAndDate(userUuid: Uuid, date: Date): Promise<SessionTrace | null>
}
