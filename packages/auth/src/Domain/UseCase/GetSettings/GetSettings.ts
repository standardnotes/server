import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Setting } from '../../Setting/Setting'
import { GetSettingsDTO } from './GetSettingsDTO'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface'

export class GetSettings implements UseCaseInterface<Array<{ setting: Setting; decryptedValue?: string | null }>> {
  constructor(
    private settingRepository: SettingRepositoryInterface,
    private settingCrypter: SettingCrypterInterface,
  ) {}

  async execute(dto: GetSettingsDTO): Promise<Result<Array<{ setting: Setting; decryptedValue?: string | null }>>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const settings = await this.settingRepository.findAllByUserUuid(userUuid.value)

    const unsensitiveSettings = settings.filter((setting) => !setting.props.sensitive)

    if (dto.decrypted) {
      const result = []
      for (const setting of unsensitiveSettings) {
        const decryptedValue = await this.settingCrypter.decryptSettingValue(setting, userUuid.value)

        result.push({
          setting,
          decryptedValue,
        })
      }

      return Result.ok(result)
    }

    return Result.ok(
      unsensitiveSettings.map((setting) => ({
        setting,
      })),
    )
  }
}
