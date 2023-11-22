import { Email, Username, Uuid } from '@standardnotes/domain-core'

import { ReadStream } from 'fs'
import { User } from './User'

export interface UserRepositoryInterface {
  streamAll(): Promise<ReadStream>
  streamTeam(memberEmail?: Email): Promise<ReadStream>
  findOneByUuid(uuid: Uuid): Promise<User | null>
  findOneByUsernameOrEmail(usernameOrEmail: Email | Username): Promise<User | null>
  findAllByUsernameOrEmail(usernameOrEmail: Email | Username): Promise<User[]>
  findAllCreatedBetween(dto: { start: Date; end: Date; offset: number; limit: number }): Promise<User[]>
  countAllCreatedBetween(start: Date, end: Date): Promise<number>
  save(user: User): Promise<User>
  remove(user: User): Promise<User>
}
