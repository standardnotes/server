import { Result, SettingName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { GetSettingDto } from './GetSettingDto'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { Setting } from '../../Setting/Setting'
import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface'
import { VerifyUserServerPassword } from '../VerifyUserServerPassword/VerifyUserServerPassword'

export class GetSetting implements UseCaseInterface<{ setting: Setting; decryptedValue?: string | null }> {
  constructor(
    private settingRepository: SettingRepositoryInterface,
    private settingCrypter: SettingCrypterInterface,
    private verifyUserServerPassword: VerifyUserServerPassword,
  ) {}

  async execute(dto: GetSettingDto): Promise<Result<{ setting: Setting; decryptedValue?: string | null }>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const settingNameOrError = SettingName.create(dto.settingName)
    if (settingNameOrError.isFailed()) {
      return Result.fail(settingNameOrError.getError())
    }
    const settingName = settingNameOrError.getValue()

    if (settingName.isASubscriptionSetting()) {
      return Result.fail(`Setting ${settingName.value} is a subscription setting!`)
    }

    if (dto.shouldVerifyUserServerPassword && [SettingName.NAMES.RecoveryCodes].includes(settingName.value)) {
      const verifyUserServerPasswordResult = await this.verifyUserServerPassword.execute({
        userUuid: dto.userUuid,
        serverPassword: dto.serverPassword,
        authTokenVersion: dto.authTokenVersion,
      })

      if (verifyUserServerPasswordResult.isFailed()) {
        return Result.fail(verifyUserServerPasswordResult.getError())
      }
    }

    const setting = await this.settingRepository.findLastByNameAndUserUuid(settingName.value, userUuid.value)
    if (setting === null) {
      return Result.fail(`Setting ${settingName.value} for user ${dto.userUuid} not found!`)
    }

    if (setting.props.sensitive && !dto.allowSensitiveRetrieval) {
      return Result.fail(`Setting ${settingName.value} for user ${dto.userUuid} is sensitive!`)
    }

    if (dto.decrypted) {
      const decryptedValue = await this.settingCrypter.decryptSettingValue(setting, userUuid.value)

      return Result.ok({
        setting,
        decryptedValue,
      })
    }

    return Result.ok({
      setting,
    })
  }
}
