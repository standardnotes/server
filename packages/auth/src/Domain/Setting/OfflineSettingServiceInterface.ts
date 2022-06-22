import { OfflineSetting } from './OfflineSetting'
import { OfflineSettingName } from './OfflineSettingName'

export interface OfflineSettingServiceInterface {
  createOrUpdate(dto: {
    email: string
    name: OfflineSettingName
    value: string
  }): Promise<{ success: boolean; offlineSetting?: OfflineSetting }>
}
