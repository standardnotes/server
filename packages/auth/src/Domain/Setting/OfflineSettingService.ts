import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'

import { OfflineSetting } from './OfflineSetting'
import { OfflineSettingName } from './OfflineSettingName'
import { OfflineSettingRepositoryInterface } from './OfflineSettingRepositoryInterface'
import { OfflineSettingServiceInterface } from './OfflineSettingServiceInterface'

@injectable()
export class OfflineSettingService implements OfflineSettingServiceInterface {
  constructor(
    @inject(TYPES.OfflineSettingRepository) private offlineSettingRepository: OfflineSettingRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async createOrUpdate(dto: {
    email: string
    name: OfflineSettingName
    value: string
  }): Promise<{ success: boolean; offlineSetting?: OfflineSetting | undefined }> {
    let offlineSetting = await this.offlineSettingRepository.findOneByNameAndEmail(dto.name, dto.email)
    if (offlineSetting === null) {
      offlineSetting = new OfflineSetting()
      offlineSetting.name = dto.name
      offlineSetting.email = dto.email
      offlineSetting.serverEncryptionVersion = EncryptionVersion.Unencrypted
      offlineSetting.createdAt = this.timer.getTimestampInMicroseconds()
    }

    offlineSetting.value = dto.value
    offlineSetting.updatedAt = this.timer.getTimestampInMicroseconds()

    offlineSetting = await this.offlineSettingRepository.save(offlineSetting)

    return {
      success: true,
      offlineSetting,
    }
  }
}
