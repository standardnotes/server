import { SubscriptionName } from '@standardnotes/common'
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
import { SettingName } from '@standardnotes/settings'
import { SettingInterpreterInterface } from './SettingInterpreterInterface'

@injectable()
export class SubscriptionSettingService implements SubscriptionSettingServiceInterface {
  constructor(
    @inject(TYPES.Auth_SettingFactory) private factory: SettingFactoryInterface,
    @inject(TYPES.Auth_SubscriptionSettingRepository)
    private subscriptionSettingRepository: SubscriptionSettingRepositoryInterface,
    @inject(TYPES.Auth_SubscriptionSettingsAssociationService)
    private subscriptionSettingAssociationService: SubscriptionSettingsAssociationServiceInterface,
    @inject(TYPES.Auth_SettingInterpreter) private settingInterpreter: SettingInterpreterInterface,
    @inject(TYPES.Auth_SettingDecrypter) private settingDecrypter: SettingDecrypterInterface,
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
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

    for (const settingNameString of defaultSettingsWithValues.keys()) {
      const settingNameOrError = SettingName.create(settingNameString)
      if (settingNameOrError.isFailed()) {
        throw new Error(settingNameOrError.getError())
      }
      const settingName = settingNameOrError.getValue()
      if (!settingName.isASubscriptionSetting()) {
        throw new Error(`Setting ${settingName.value} is not a subscription setting`)
      }

      const setting = defaultSettingsWithValues.get(settingName.value) as SettingDescription
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
          name: settingName.value,
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
    if (!dto.subscriptionSettingName.isASubscriptionSetting()) {
      throw new Error(`Setting ${dto.subscriptionSettingName.value} is not a subscription setting`)
    }

    let setting: SubscriptionSetting | null
    if (dto.settingUuid !== undefined) {
      setting = await this.subscriptionSettingRepository.findOneByUuid(dto.settingUuid)
    } else {
      setting = await this.subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid(
        dto.subscriptionSettingName.value,
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

    const settingNameOrError = SettingName.create(props.name)
    if (settingNameOrError.isFailed()) {
      throw new Error(settingNameOrError.getError())
    }
    const settingName = settingNameOrError.getValue()

    if (!settingName.isASubscriptionSetting()) {
      throw new Error(`Setting ${settingName.value} is not a subscription setting`)
    }

    const user = await userSubscription.user
    const existing = await this.findSubscriptionSettingWithDecryptedValue({
      userUuid: user.uuid,
      userSubscriptionUuid: userSubscription.uuid,
      subscriptionSettingName: settingName,
      settingUuid: props.uuid,
    })

    if (existing === null) {
      const subscriptionSetting = await this.subscriptionSettingRepository.save(
        await this.factory.createSubscriptionSetting(props, userSubscription),
      )

      this.logger.debug('Created subscription setting %s: %O', props.name, subscriptionSetting)

      await this.settingInterpreter.interpretSettingUpdated(settingName.value, user, props.unencryptedValue)

      return {
        status: 'created',
        subscriptionSetting,
      }
    }

    const subscriptionSetting = await this.subscriptionSettingRepository.save(
      await this.factory.createSubscriptionSettingReplacement(existing, props),
    )

    this.logger.debug('Replaced existing subscription setting %s with: %O', props.name, subscriptionSetting)

    await this.settingInterpreter.interpretSettingUpdated(settingName.value, user, props.unencryptedValue)

    return {
      status: 'replaced',
      subscriptionSetting,
    }
  }

  private async findPreviousSubscriptionSetting(
    settingName: SettingName,
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

    return this.subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid(
      settingName.value,
      lastSubscription.uuid,
    )
  }
}
