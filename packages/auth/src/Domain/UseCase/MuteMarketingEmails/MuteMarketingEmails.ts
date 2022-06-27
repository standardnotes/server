import { MuteMarketingEmailsOption, SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { MuteMarketingEmailsDTO } from './MuteMarketingEmailsDTO'
import { MuteMarketingEmailsResponse } from './MuteMarketingEmailsResponse'

@injectable()
export class MuteMarketingEmails implements UseCaseInterface {
  constructor(@inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface) {}

  async execute(dto: MuteMarketingEmailsDTO): Promise<MuteMarketingEmailsResponse> {
    const setting = await this.settingRepository.findOneByUuidAndNames(dto.settingUuid, [
      SettingName.MuteMarketingEmails,
    ])

    if (setting === null) {
      return {
        success: false,
        message: 'Could not find setting setting.',
      }
    }

    setting.value = MuteMarketingEmailsOption.Muted

    await this.settingRepository.save(setting)

    return {
      success: true,
      message: 'These emails have been muted.',
    }
  }
}
