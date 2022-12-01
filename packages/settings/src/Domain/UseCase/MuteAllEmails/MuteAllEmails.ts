import { Result, SettingName, UseCaseInterface } from '@standardnotes/domain-core'

import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { MuteAllEmailsDTO } from './MuteAllEmailsDTO'

export class MuteAllEmails implements UseCaseInterface<string> {
  constructor(private settingRepository: SettingRepositoryInterface) {}

  async execute(dto: MuteAllEmailsDTO): Promise<Result<string>> {
    if (!dto.unsubscribeToken) {
      return Result.fail('No unsubscribe token provider')
    }

    const unsubscribeTokenSetting = await this.settingRepository.findOneByNameAndValue(
      SettingName.create(SettingName.NAMES.EmailUnsubscribeToken).getValue(),
      dto.unsubscribeToken,
    )
    if (unsubscribeTokenSetting === null) {
      return Result.fail(`Could not find user with given unsubscribe token: ${dto.unsubscribeToken}`)
    }

    await this.settingRepository.setValueOnMultipleSettings(
      [SettingName.NAMES.MuteMarketingEmails],
      unsubscribeTokenSetting.props.userUuid,
      'muted',
    )

    return Result.ok('Muted all emails.')
  }
}
