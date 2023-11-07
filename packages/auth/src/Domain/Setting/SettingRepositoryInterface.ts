import { SettingName } from '@standardnotes/domain-core'

import { DeleteSettingDto } from '../UseCase/DeleteSetting/DeleteSettingDto'
import { Setting } from './Setting'

export interface SettingRepositoryInterface {
  findOneByUuid(uuid: string): Promise<Setting | null>
  findOneByUuidAndNames(uuid: string, names: SettingName[]): Promise<Setting | null>
  findOneByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null>
  findLastByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null>
  findAllByUserUuid(userUuid: string): Promise<Setting[]>
  countAllByNameAndValue(dto: { name: SettingName; value: string }): Promise<number>
  findAllByNameAndValue(dto: { name: SettingName; value: string; offset: number; limit: number }): Promise<Setting[]>
  deleteByUserUuid(dto: DeleteSettingDto): Promise<void>
  insert(setting: Setting): Promise<void>
  update(setting: Setting): Promise<void>
}
