import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionSettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { UserSubscription } from '../Subscription/UserSubscription'

import { SettingDecrypterInterface } from './SettingDecrypterInterface'
import { SettingDescription } from './SettingDescription'
import { SubscriptionSettingServiceInterface } from './SubscriptionSettingServiceInterface'
import { CreateOrReplaceSubscriptionSettingDTO } from './CreateOrReplaceSubscriptionSettingDTO'
import { CreateOrReplaceSubscriptionSettingResponse } from './CreateOrReplaceSubscriptionSettingResponse'
import { SubscriptionSetting } from './SubscriptionSetting'
import { FindSubscriptionSettingDTO } from './FindSubscriptionSettingDTO'
import { SubscriptionSettingRepositoryInterface } from './SubscriptionSettingRepositoryInterface'
import { SettingFactoryInterface } from './SettingFactoryInterface'
import { SubscriptionSettingsAssociationServiceInterface } from './SubscriptionSettingsAssociationServiceInterface'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'

@injectable()
export class SubscriptionSettingService implements SubscriptionSettingServiceInterface {
  constructor(
    @inject(TYPES.SettingFactory) private factory: SettingFactoryInterface,
    @inject(TYPES.SubscriptionSettingRepository)
    private subscriptionSettingRepository: SubscriptionSettingRepositoryInterface,
    @inject(TYPES.SubscriptionSettingsAssociationService)
    private subscriptionSettingAssociationService: SubscriptionSettingsAssociationServiceInterface,
    @inject(TYPES.SettingDecrypter) private settingDecrypter: SettingDecrypterInterface,
    @inject(TYPES.UserSubscriptionRepository) private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async applyDefaultSubscriptionSettingsForSubscription(
    userSubscription: UserSubscription,
    subscriptionName: SubscriptionName,
    userUuid: string,
  ): Promise<void> {
    const defaultSettingsWithValues =
      await this.subscriptionSettingAssociationService.getDefaultSettingsAndValuesForSubscriptionName(subscriptionName)
    if (defaultSettingsWithValues === undefined) {
      this.logger.warn(`Could not find settings for subscription: ${subscriptionName}`)

      return
    }

    for (const settingName of defaultSettingsWithValues.keys()) {
      const setting = defaultSettingsWithValues.get(settingName) as SettingDescription
      if (!setting.replaceable) {
        const existingSetting = await this.findPreviousSubscriptionSetting(settingName, userSubscription.uuid, userUuid)
        if (existingSetting !== null) {
          existingSetting.userSubscription = Promise.resolve(userSubscription)
          await this.subscriptionSettingRepository.save(existingSetting)

          continue
        }
      }

      await this.createOrReplace({
        userSubscription,
        props: {
          name: settingName,
          unencryptedValue: setting.value,
          serverEncryptionVersion: setting.serverEncryptionVersion,
          sensitive: setting.sensitive,
        },
      })
    }
  }

  async findSubscriptionSettingWithDecryptedValue(
    dto: FindSubscriptionSettingDTO,
  ): Promise<SubscriptionSetting | null> {
    let setting: SubscriptionSetting | null
    if (dto.settingUuid !== undefined) {
      setting = await this.subscriptionSettingRepository.findOneByUuid(dto.settingUuid)
    } else {
      setting = await this.subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid(
        dto.subscriptionSettingName,
        dto.userSubscriptionUuid,
      )
    }

    if (setting === null) {
      return null
    }

    setting.value = await this.settingDecrypter.decryptSettingValue(setting, dto.userUuid)

    return setting
  }

  async createOrReplace(
    dto: CreateOrReplaceSubscriptionSettingDTO,
  ): Promise<CreateOrReplaceSubscriptionSettingResponse> {
    const { userSubscription, props } = dto

    const existing = await this.findSubscriptionSettingWithDecryptedValue({
      userUuid: (await userSubscription.user).uuid,
      userSubscriptionUuid: userSubscription.uuid,
      subscriptionSettingName: props.name as SubscriptionSettingName,
      settingUuid: props.uuid,
    })

    if (existing === null) {
      const subscriptionSetting = await this.subscriptionSettingRepository.save(
        await this.factory.createSubscriptionSetting(props, userSubscription),
      )

      this.logger.debug('Created subscription setting %s: %O', props.name, subscriptionSetting)

      return {
        status: 'created',
        subscriptionSetting,
      }
    }

    const subscriptionSetting = await this.subscriptionSettingRepository.save(
      await this.factory.createSubscriptionSettingReplacement(existing, props),
    )

    this.logger.debug('Replaced existing subscription setting %s with: %O', props.name, subscriptionSetting)

    return {
      status: 'replaced',
      subscriptionSetting,
    }
  }

  private async findPreviousSubscriptionSetting(
    settingName: SubscriptionSettingName,
    currentUserSubscriptionUuid: string,
    userUuid: string,
  ): Promise<SubscriptionSetting | null> {
    const userSubscriptions = await this.userSubscriptionRepository.findByUserUuid(userUuid)
    const previousSubscriptions = userSubscriptions.filter(
      (subscription) => subscription.uuid !== currentUserSubscriptionUuid,
    )
    const lastSubscription = previousSubscriptions.shift()

    if (!lastSubscription) {
      return null
    }

    return this.subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid(settingName, lastSubscription.uuid)
  }
}
