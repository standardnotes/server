import { RevokedSession } from './RevokedSession'

export interface RevokedSessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<RevokedSession | null>
  findAllByUserUuid(userUuid: string): Promise<Array<RevokedSession>>
  save(revokedSession: RevokedSession): Promise<RevokedSession>
  remove(revokedSession: RevokedSession): Promise<RevokedSession>
  clearUserAgentByUserUuid(userUuid: string): Promise<void>
}
