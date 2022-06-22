import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { User } from '../User/User'
import { Setting } from './Setting'
import { SettingFactory } from './SettingFactory'
import { SettingProps } from './SettingProps'
import { SubscriptionSettingProps } from './SubscriptionSettingProps'
import { UserSubscription } from '../Subscription/UserSubscription'
import { SubscriptionSetting } from './SubscriptionSetting'

describe('SettingFactory', () => {
  let crypter: CrypterInterface
  let timer: TimerInterface
  let user: User
  let userSubscription: UserSubscription

  const createFactory = () => new SettingFactory(crypter, timer)

  beforeEach(() => {
    crypter = {} as jest.Mocked<CrypterInterface>
    crypter.encryptForUser = jest.fn().mockReturnValue('encrypted')

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)

    user = {} as jest.Mocked<User>

    userSubscription = {
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>
  })

  it('should create a Setting', async () => {
    const props: SettingProps = {
      name: 'name',
      unencryptedValue: 'value',
      serverEncryptionVersion: EncryptionVersion.Unencrypted,
      sensitive: false,
    }
    const actual = await createFactory().create(props, user)

    expect(actual).toEqual({
      createdAt: 1,
      updatedAt: 1,
      name: 'name',
      sensitive: false,
      serverEncryptionVersion: 0,
      user: Promise.resolve(user),
      uuid: expect.any(String),
      value: 'value',
    })
  })

  it('should create a SubscriptionSetting', async () => {
    const props: SubscriptionSettingProps = {
      name: 'name',
      unencryptedValue: 'value',
      serverEncryptionVersion: EncryptionVersion.Unencrypted,
      sensitive: false,
    }
    const actual = await createFactory().createSubscriptionSetting(props, userSubscription)

    expect(actual).toEqual({
      createdAt: 1,
      updatedAt: 1,
      name: 'name',
      sensitive: false,
      serverEncryptionVersion: 0,
      userSubscription: Promise.resolve(userSubscription),
      uuid: expect.any(String),
      value: 'value',
    })
  })

  it('should create an encrypted SubscriptionSetting', async () => {
    const value = 'value'
    const props: SettingProps = {
      name: 'name',
      unencryptedValue: value,
      sensitive: false,
    }

    const actual = await createFactory().createSubscriptionSetting(props, userSubscription)

    expect(actual).toEqual({
      createdAt: 1,
      updatedAt: 1,
      name: 'name',
      sensitive: false,
      serverEncryptionVersion: 1,
      userSubscription: Promise.resolve(userSubscription),
      uuid: expect.any(String),
      value: 'encrypted',
    })
  })

  it('should create a SubscriptionSetting replacement', async () => {
    const original = {
      userSubscription: Promise.resolve(userSubscription),
    } as jest.Mocked<SubscriptionSetting>
    original.uuid = '2-3-4'

    const props: SettingProps = {
      name: 'name',
      unencryptedValue: 'value2',
      serverEncryptionVersion: EncryptionVersion.Unencrypted,
      sensitive: true,
    }

    const actual = await createFactory().createSubscriptionSettingReplacement(original, props)

    expect(actual).toEqual({
      createdAt: 1,
      updatedAt: 1,
      name: 'name',
      sensitive: true,
      serverEncryptionVersion: 0,
      userSubscription: Promise.resolve(userSubscription),
      uuid: '2-3-4',
      value: 'value2',
    })
  })

  it('should create a Setting replacement', async () => {
    const original = {} as jest.Mocked<Setting>
    original.uuid = '2-3-4'

    const props: SettingProps = {
      name: 'name',
      unencryptedValue: 'value2',
      serverEncryptionVersion: EncryptionVersion.Unencrypted,
      sensitive: true,
    }

    const actual = await createFactory().createReplacement(original, props)

    expect(actual).toEqual({
      createdAt: 1,
      updatedAt: 1,
      name: 'name',
      sensitive: true,
      serverEncryptionVersion: 0,
      user: Promise.resolve(user),
      uuid: '2-3-4',
      value: 'value2',
    })
  })

  it('should create an encrypted Setting', async () => {
    const value = 'value'
    const props: SettingProps = {
      name: 'name',
      unencryptedValue: value,
      sensitive: false,
    }

    const actual = await createFactory().create(props, user)

    expect(actual).toEqual({
      createdAt: 1,
      updatedAt: 1,
      name: 'name',
      sensitive: false,
      serverEncryptionVersion: 1,
      user: Promise.resolve(user),
      uuid: expect.any(String),
      value: 'encrypted',
    })
  })

  it('should throw for unrecognized encryption version', async () => {
    const value = 'value'
    const props: SettingProps = {
      name: 'name',
      unencryptedValue: value,
      serverEncryptionVersion: 99999999999,
      sensitive: false,
    }

    await expect(async () => await createFactory().create(props, user)).rejects.toThrow()
  })
})
