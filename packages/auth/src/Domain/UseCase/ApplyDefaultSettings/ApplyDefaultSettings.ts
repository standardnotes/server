import { Result, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'

import { SettingsAssociationServiceInterface } from '../../Setting/SettingsAssociationServiceInterface'
import { ApplyDefaultSettingsDTO } from './ApplyDefaultSettingsDTO'
import { SetSettingValue } from '../SetSettingValue/SetSettingValue'
import { SettingDescription } from '../../Setting/SettingDescription'

export class ApplyDefaultSettings implements UseCaseInterface<void> {
  constructor(
    private settingsAssociationService: SettingsAssociationServiceInterface,
    private setSettingValue: SetSettingValue,
  ) {}

  async execute(dto: ApplyDefaultSettingsDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const userNameOrError = Username.create(dto.userName)
    if (userNameOrError.isFailed()) {
      return Result.fail(userNameOrError.getError())
    }
    const userName = userNameOrError.getValue()

    let defaultSettingsWithValues = this.settingsAssociationService.getDefaultSettingsAndValuesForNewUser()
    if (userName.isPotentiallyAPrivateUsernameAccount()) {
      defaultSettingsWithValues =
        this.settingsAssociationService.getDefaultSettingsAndValuesForNewPrivateUsernameAccount()
    }

    for (const settingName of defaultSettingsWithValues.keys()) {
      const setting = defaultSettingsWithValues.get(settingName) as SettingDescription

      await this.setSettingValue.execute({
        settingName: settingName,
        userUuid: userUuid.value,
        value: setting.value,
      })
    }

    return Result.ok()
  }
}
