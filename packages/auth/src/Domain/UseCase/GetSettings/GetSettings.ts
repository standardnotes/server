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
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { SimpleSetting } from '../../Setting/SimpleSetting'
import { SimpleSubscriptionSetting } from '../../Setting/SimpleSubscriptionSetting'
import { SubscriptionSettingProjector } from '../../../Projection/SubscriptionSettingProjector'

@injectable()
export class GetSettings implements UseCaseInterface {
  constructor(
    @inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.SubscriptionSettingRepository)
    private subscriptionSettingRepository: SubscriptionSettingRepositoryInterface,
    @inject(TYPES.UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.SettingProjector) private settingProjector: SettingProjector,
    @inject(TYPES.SubscriptionSettingProjector) private subscriptionSettingProjector: SubscriptionSettingProjector,
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

    let settings: Array<Setting | SubscriptionSetting>
    settings = await this.settingRepository.findAllByUserUuid(userUuid)

    const { regularSubscription, sharedSubscription } =
      await this.userSubscriptionService.findRegularSubscriptionForUserUuid(user.uuid)
    const subscription = sharedSubscription ?? regularSubscription
    if (subscription) {
      const subscriptionSettings = await this.subscriptionSettingRepository.findAllBySubscriptionUuid(subscription.uuid)
      settings = settings.concat(subscriptionSettings)
    }

    if (dto.settingName !== undefined) {
      settings = settings.filter((setting: Setting | SubscriptionSetting) => setting.name === dto.settingName)
    }

    if (dto.updatedAfter !== undefined) {
      settings = settings.filter(
        (setting: Setting | SubscriptionSetting) => setting.updatedAt >= (dto.updatedAfter as number),
      )
    }

    if (!dto.allowSensitiveRetrieval) {
      settings = settings.filter((setting: Setting | SubscriptionSetting) => !setting.sensitive)
    }

    const simpleSettings: Array<SimpleSetting | SimpleSubscriptionSetting> = []
    for (const setting of settings) {
      if (setting.value !== null && setting.serverEncryptionVersion === EncryptionVersion.Default) {
        setting.value = await this.crypter.decryptForUser(setting.value, user)
      }

      if (setting instanceof SubscriptionSetting) {
        simpleSettings.push(await this.subscriptionSettingProjector.projectSimple(setting))
      } else {
        simpleSettings.push(await this.settingProjector.projectSimple(setting))
      }
    }

    return {
      success: true,
      userUuid,
      settings: simpleSettings,
    }
  }
}
