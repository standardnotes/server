import { Uuid } from '@standardnotes/domain-core'

import { Session } from './Session'

export interface SessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<Session | null>
  findOneByPrivateIdentifier(privateIdentifier: string): Promise<Session | null>
  findOneByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Session | null>
  findAllByRefreshExpirationAndUserUuid(userUuid: string): Promise<Array<Session>>
  findAllByUserUuid(userUuid: string): Promise<Array<Session>>
  deleteAllByUserUuidExceptOne(dto: { userUuid: Uuid; currentSessionUuid: Uuid }): Promise<void>
  deleteOneByUuid(uuid: string): Promise<void>
  insert(session: Session): Promise<void>
  update(session: Session): Promise<void>
  remove(session: Session): Promise<Session>
  clearUserAgentByUserUuid(userUuid: string): Promise<void>
  removeExpiredBefore(date: Date): Promise<void>
}
