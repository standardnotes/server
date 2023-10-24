import { Result, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'

import { SettingsAssociationServiceInterface } from '../../Setting/SettingsAssociationServiceInterface'
import { ApplyDefaultSettingsDTO } from './ApplyDefaultSettingsDTO'
import { SetSettingValue } from '../SetSettingValue/SetSettingValue'

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
      const setting = defaultSettingsWithValues.get(settingName) as {
        value: string
        sensitive: boolean
        serverEncryptionVersion: number
      }

      await this.setSettingValue.execute({
        sensitive: setting.sensitive,
        settingName: settingName,
        userUuid: userUuid.value,
        value: setting.value,
        serverEncryptionVersion: setting.serverEncryptionVersion,
      })
    }

    return Result.ok()
  }
}
