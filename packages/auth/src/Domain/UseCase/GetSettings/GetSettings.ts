import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Setting } from '../../Setting/Setting'
import { GetSettingsDTO } from './GetSettingsDTO'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { SettingDecrypterInterface } from '../../Setting/SettingDecrypterInterface'

export class GetSettings implements UseCaseInterface<Array<{ setting: Setting; decryptedValue?: string | null }>> {
  constructor(
    private settingRepository: SettingRepositoryInterface,
    private settingDecrypter: SettingDecrypterInterface,
  ) {}

  async execute(dto: GetSettingsDTO): Promise<Result<Array<{ setting: Setting; decryptedValue?: string | null }>>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const settings = await this.settingRepository.findAllByUserUuid(userUuid.value)

    if (dto.decrypted) {
      const result = []
      for (const setting of settings) {
        const decryptedValue = await this.settingDecrypter.decryptSettingValue(setting, userUuid.value)

        result.push({
          setting,
          decryptedValue,
        })
      }

      return Result.ok(result)
    }

    return Result.ok(
      settings.map((setting) => ({
        setting,
      })),
    )
  }
}
