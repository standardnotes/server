import { OfflineSetting } from './OfflineSetting'
import { OfflineSettingName } from './OfflineSettingName'

export interface OfflineSettingRepositoryInterface {
  findOneByNameAndEmail(name: OfflineSettingName, email: string): Promise<OfflineSetting | null>
  findOneByNameAndValue(name: OfflineSettingName, value: string): Promise<OfflineSetting | null>
  save(offlineSetting: OfflineSetting): Promise<OfflineSetting>
}
