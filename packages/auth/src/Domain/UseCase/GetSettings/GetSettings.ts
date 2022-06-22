import { inject, injectable } from 'inversify'
import { GetSettingsDto } from './GetSettingsDto'
import { GetSettingsResponse } from './GetSettingsResponse'
import { UseCaseInterface } from '../UseCaseInterface'
import TYPES from '../../../Bootstrap/Types'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { SettingProjector } from '../../../Projection/SettingProjector'
import { Setting } from '../../Setting/Setting'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { CrypterInterface } from '../../Encryption/CrypterInterface'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'

@injectable()
export class GetSettings implements UseCaseInterface {
  constructor(
    @inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.SettingProjector) private settingProjector: SettingProjector,
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Crypter) private crypter: CrypterInterface,
  ) {}

  async execute(dto: GetSettingsDto): Promise<GetSettingsResponse> {
    const { userUuid } = dto

    const user = await this.userRepository.findOneByUuid(userUuid)

    if (user === null) {
      return {
        success: false,
        error: {
          message: `User ${userUuid} not found.`,
        },
      }
    }

    let settings = await this.settingRepository.findAllByUserUuid(userUuid)

    if (dto.settingName !== undefined) {
      settings = settings.filter((setting: Setting) => setting.name === dto.settingName)
    }

    if (dto.updatedAfter !== undefined) {
      settings = settings.filter((setting: Setting) => setting.updatedAt >= (dto.updatedAfter as number))
    }

    if (!dto.allowSensitiveRetrieval) {
      settings = settings.filter((setting: Setting) => !setting.sensitive)
    }

    for (const setting of settings) {
      if (setting.value !== null && setting.serverEncryptionVersion === EncryptionVersion.Default) {
        setting.value = await this.crypter.decryptForUser(setting.value, user)
      }
    }

    const simpleSettings = await this.settingProjector.projectManySimple(settings)

    return {
      success: true,
      userUuid,
      settings: simpleSettings,
    }
  }
}
