import { User } from '../User/User'
import { CreateOrReplaceSettingDto } from './CreateOrReplaceSettingDto'
import { CreateOrReplaceSettingResponse } from './CreateOrReplaceSettingResponse'
import { FindSettingDTO } from './FindSettingDTO'
import { Setting } from './Setting'

export interface SettingServiceInterface {
  applyDefaultSettingsUponRegistration(user: User): Promise<void>
  createOrReplace(dto: CreateOrReplaceSettingDto): Promise<CreateOrReplaceSettingResponse>
  findSettingWithDecryptedValue(dto: FindSettingDTO): Promise<Setting | null>
}
