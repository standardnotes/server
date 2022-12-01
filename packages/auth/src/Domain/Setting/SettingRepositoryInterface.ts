import { ReadStream } from 'fs'

import { DeleteSettingDto } from '../UseCase/DeleteSetting/DeleteSettingDto'
import { Setting } from './Setting'

export interface SettingRepositoryInterface {
  findOneByUuid(uuid: string): Promise<Setting | null>
  findOneByUuidAndNames(uuid: string, names: string[]): Promise<Setting | null>
  findOneByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null>
  findLastByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null>
  findAllByUserUuid(userUuid: string): Promise<Setting[]>
  streamAllByNameAndValue(name: string, value: string): Promise<ReadStream>
  deleteByUserUuid(dto: DeleteSettingDto): Promise<void>
  save(setting: Setting): Promise<Setting>
}
