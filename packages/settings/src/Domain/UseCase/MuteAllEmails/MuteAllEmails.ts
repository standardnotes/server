import { Result, SettingName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { MuteAllEmailsDTO } from './MuteAllEmailsDTO'

export class MuteAllEmails implements UseCaseInterface<string> {
  constructor(private settingRepository: SettingRepositoryInterface) {}

  async execute(dto: MuteAllEmailsDTO): Promise<Result<string>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not mute user emails: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    await this.settingRepository.setValueOnMultipleSettings([SettingName.NAMES.MuteMarketingEmails], userUuid, 'muted')

    return Result.ok('Muted all emails.')
  }
}
