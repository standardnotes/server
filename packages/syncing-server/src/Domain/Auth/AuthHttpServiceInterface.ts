import { SettingName } from 'aws-sdk/clients/ecs'
import { KeyParamsData } from '@standardnotes/responses'

export interface AuthHttpServiceInterface {
  getUserKeyParams(dto: { email?: string; uuid?: string; authenticated: boolean }): Promise<KeyParamsData>
  getUserSetting(userUuid: string, settingName: SettingName): Promise<{ uuid: string; value: string | null }>
}
