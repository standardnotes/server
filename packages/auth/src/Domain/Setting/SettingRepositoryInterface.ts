import { ReadStream } from 'fs'
import { SettingName } from '@standardnotes/domain-core'

import { DeleteSettingDto } from '../UseCase/DeleteSetting/DeleteSettingDto'
import { Setting } from './Setting'

export interface SettingRepositoryInterface {
  findOneByUuid(uuid: string): Promise<Setting | null>
  findOneByUuidAndNames(uuid: string, names: SettingName[]): Promise<Setting | null>
  findOneByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null>
  findLastByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null>
  findAllByUserUuid(userUuid: string): Promise<Setting[]>
  streamAllByNameAndValue(name: SettingName, value: string): Promise<ReadStream>
  streamAllByName(name: SettingName): Promise<ReadStream>
  deleteByUserUuid(dto: DeleteSettingDto): Promise<void>
  insert(setting: Setting): Promise<void>
  update(setting: Setting): Promise<void>
}
