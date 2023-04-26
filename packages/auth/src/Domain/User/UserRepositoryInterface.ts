import { Email, Username } from '@standardnotes/domain-core'

import { ReadStream } from 'fs'
import { User } from './User'

export interface UserRepositoryInterface {
  streamAll(): Promise<ReadStream>
  streamTeam(memberEmail?: Email): Promise<ReadStream>
  findOneByUuid(uuid: string): Promise<User | null>
  findOneByUsernameOrEmail(usernameOrEmail: Email | Username): Promise<User | null>
  save(user: User): Promise<User>
  remove(user: User): Promise<User>
}
