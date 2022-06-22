import { MuteSignInEmailsOption, SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { MuteSignInEmailsDTO } from './MuteSignInEmailsDTO'
import { MuteSignInEmailsResponse } from './MuteSignInEmailsResponse'

@injectable()
export class MuteSignInEmails implements UseCaseInterface {
  constructor(@inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface) {}

  async execute(dto: MuteSignInEmailsDTO): Promise<MuteSignInEmailsResponse> {
    const setting = await this.settingRepository.findOneByUuidAndNames(dto.settingUuid, [SettingName.MuteSignInEmails])

    if (setting === null) {
      return {
        success: false,
        message: 'Could not find setting setting.',
      }
    }

    setting.value = MuteSignInEmailsOption.Muted

    await this.settingRepository.save(setting)

    return {
      success: true,
      message: 'These emails have been muted.',
    }
  }
}
