import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { User } from '../User/User'
import { Setting } from './Setting'
import { SettingProps } from './SettingProps'
import { v4 as uuidv4 } from 'uuid'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { TimerInterface } from '@standardnotes/time'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SettingFactoryInterface } from './SettingFactoryInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { SubscriptionSetting } from './SubscriptionSetting'
import { SubscriptionSettingProps } from './SubscriptionSettingProps'

@injectable()
export class SettingFactory implements SettingFactoryInterface {
  constructor(
    @inject(TYPES.Auth_Crypter) private crypter: CrypterInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
  ) {}

  async createSubscriptionSetting(
    props: SubscriptionSettingProps,
    userSubscription: UserSubscription,
  ): Promise<SubscriptionSetting> {
    const uuid = props.uuid ?? uuidv4()
    const now = this.timer.getTimestampInMicroseconds()
    const createdAt = props.createdAt ?? now
    const updatedAt = props.updatedAt ?? now

    const { name, unencryptedValue, serverEncryptionVersion = EncryptionVersion.Default, sensitive } = props

    const subscriptionSetting = {
      uuid,
      userSubscription: Promise.resolve(userSubscription),
      name,
      value: await this.createValue({
        unencryptedValue,
        serverEncryptionVersion,
        user: await userSubscription.user,
      }),
      serverEncryptionVersion,
      createdAt,
      updatedAt,
      sensitive,
    }

    return Object.assign(new SubscriptionSetting(), subscriptionSetting)
  }

  async createSubscriptionSettingReplacement(
    original: SubscriptionSetting,
    props: SubscriptionSettingProps,
  ): Promise<SubscriptionSetting> {
    const { uuid, userSubscription } = original

    return Object.assign(await this.createSubscriptionSetting(props, await userSubscription), {
      uuid,
    })
  }

  async create(props: SettingProps, user: User): Promise<Setting> {
    const uuid = props.uuid ?? uuidv4()
    const now = this.timer.getTimestampInMicroseconds()
    const createdAt = props.createdAt ?? now
    const updatedAt = props.updatedAt ?? now

    const { name, unencryptedValue, serverEncryptionVersion = EncryptionVersion.Default, sensitive } = props

    const setting = {
      uuid,
      user: Promise.resolve(user),
      name,
      value: await this.createValue({
        unencryptedValue,
        serverEncryptionVersion,
        user,
      }),
      serverEncryptionVersion,
      createdAt,
      updatedAt,
      sensitive,
    }

    return Object.assign(new Setting(), setting)
  }

  async createReplacement(original: Setting, props: SettingProps): Promise<Setting> {
    const { uuid, user } = original

    return Object.assign(await this.create(props, await user), {
      uuid,
    })
  }

  async createValue({
    unencryptedValue,
    serverEncryptionVersion,
    user,
  }: {
    unencryptedValue: string | null
    serverEncryptionVersion: number
    user: User
  }): Promise<string | null> {
    switch (serverEncryptionVersion) {
      case EncryptionVersion.Unencrypted:
        return unencryptedValue
      case EncryptionVersion.Default:
        return this.crypter.encryptForUser(unencryptedValue as string, user)
      default:
        throw Error(`Unrecognized encryption version: ${serverEncryptionVersion}!`)
    }
  }
}
