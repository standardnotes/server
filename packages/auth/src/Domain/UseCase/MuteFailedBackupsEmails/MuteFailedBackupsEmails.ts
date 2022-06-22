import { MuteFailedBackupsEmailsOption, SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { MuteFailedBackupsEmailsDTO } from './MuteFailedBackupsEmailsDTO'
import { MuteFailedBackupsEmailsResponse } from './MuteFailedBackupsEmailsResponse'

@injectable()
export class MuteFailedBackupsEmails implements UseCaseInterface {
  constructor(@inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface) {}

  async execute(dto: MuteFailedBackupsEmailsDTO): Promise<MuteFailedBackupsEmailsResponse> {
    const setting = await this.settingRepository.findOneByUuidAndNames(dto.settingUuid, [
      SettingName.MuteFailedBackupsEmails,
      SettingName.MuteFailedCloudBackupsEmails,
    ])

    if (setting === null) {
      return {
        success: false,
        message: 'Could not find setting setting.',
      }
    }

    setting.value = MuteFailedBackupsEmailsOption.Muted

    await this.settingRepository.save(setting)

    return {
      success: true,
      message: 'These emails have been muted.',
    }
  }
}
