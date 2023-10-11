import { RevokedSession } from './RevokedSession'

export interface RevokedSessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<RevokedSession | null>
  findAllByUserUuid(userUuid: string): Promise<Array<RevokedSession>>
  insert(revokedSession: RevokedSession): Promise<void>
  update(revokedSession: RevokedSession): Promise<void>
  remove(revokedSession: RevokedSession): Promise<RevokedSession>
  clearUserAgentByUserUuid(userUuid: string): Promise<void>
}
