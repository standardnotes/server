import { UpdateStorageQuotaUsedForUser } from './UpdateStorageQuotaUsedForUser'

import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { SetSubscriptionSettingValue } from '../SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { Logger } from 'winston'
import { Result, SettingName, Timestamps, Uuid } from '@standardnotes/domain-core'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'

describe('UpdateStorageQuotaUsedForUser', () => {
  let userRepository: UserRepositoryInterface
  let user: User
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription
  let getSharedSubscription: GetSharedSubscriptionForUser
  let getRegularSubscription: GetRegularSubscriptionForUser
  let getSubscriptionSetting: GetSubscriptionSetting
  let setSubscriptonSettingValue: SetSubscriptionSettingValue
  let logger: Logger

  const createUseCase = () =>
    new UpdateStorageQuotaUsedForUser(
      userRepository,
      getRegularSubscription,
      getSharedSubscription,
      getSubscriptionSetting,
      setSubscriptonSettingValue,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '123',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    regularSubscription = {
      uuid: '00000000-0000-0000-0000-000000000000',
      subscriptionType: UserSubscriptionType.Regular,
      userUuid: '123',
    } as jest.Mocked<UserSubscription>

    sharedSubscription = {
      uuid: '2-3-4',
      subscriptionType: UserSubscriptionType.Shared,
      userUuid: '123',
    } as jest.Mocked<UserSubscription>

    getSharedSubscription = {} as jest.Mocked<GetSharedSubscriptionForUser>
    getSharedSubscription.execute = jest.fn().mockReturnValue(Result.ok(sharedSubscription))

    getRegularSubscription = {} as jest.Mocked<GetRegularSubscriptionForUser>
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.ok(regularSubscription))

    getSubscriptionSetting = {} as jest.Mocked<GetSubscriptionSetting>
    getSubscriptionSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    setSubscriptonSettingValue = {} as jest.Mocked<SetSubscriptionSettingValue>
    setSubscriptonSettingValue.execute = jest.fn().mockReturnValue(Result.ok())

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should create a bytes used setting if one does not exist', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 123,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(setSubscriptonSettingValue.execute).toHaveBeenCalledWith({
      settingName: 'FILE_UPLOAD_BYTES_USED',
      value: '123',
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
    })
  })

  it('should not do anything if a user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(setSubscriptonSettingValue.execute).not.toHaveBeenCalled()
  })

  it('should not do anything if a user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      bytesUsed: 123,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(setSubscriptonSettingValue.execute).not.toHaveBeenCalled()
  })

  describe('updating existing quota', () => {
    beforeEach(() => {
      getSubscriptionSetting.execute = jest.fn().mockReturnValue(
        Result.ok({
          setting: SubscriptionSetting.create({
            name: SettingName.NAMES.FileUploadBytesUsed,
            sensitive: false,
            serverEncryptionVersion: EncryptionVersion.Unencrypted,
            timestamps: Timestamps.create(123, 123).getValue(),
            userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            value: '345',
          }).getValue(),
        }),
      )
    })

    it('should not do anything if a user subscription is not found', async () => {
      getRegularSubscription.execute = jest.fn().mockReturnValue(Result.fail('error'))
      getSharedSubscription.execute = jest.fn().mockReturnValue(Result.fail('error'))

      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        bytesUsed: 123,
      })
      expect(result.isFailed()).toBeTruthy()

      expect(setSubscriptonSettingValue.execute).not.toHaveBeenCalled()
    })

    it('should add bytes used setting if one does exist', async () => {
      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        bytesUsed: 123,
      })
      expect(result.isFailed()).toBeFalsy()

      expect(setSubscriptonSettingValue.execute).toHaveBeenCalledWith({
        settingName: 'FILE_UPLOAD_BYTES_USED',
        value: '468',
        userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      })
    })

    it('should subtract bytes used setting if one does exist', async () => {
      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        bytesUsed: -123,
      })
      expect(result.isFailed()).toBeFalsy()

      expect(setSubscriptonSettingValue.execute).toHaveBeenCalledWith({
        settingName: 'FILE_UPLOAD_BYTES_USED',
        value: '222',
        userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      })
    })

    it('should update a bytes used setting on both regular and shared subscription', async () => {
      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        bytesUsed: 123,
      })
      expect(result.isFailed()).toBeFalsy()

      expect(setSubscriptonSettingValue.execute).toHaveBeenCalledWith({
        settingName: 'FILE_UPLOAD_BYTES_USED',
        value: '468',
        userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(setSubscriptonSettingValue.execute).toHaveBeenCalledWith({
        settingName: 'FILE_UPLOAD_BYTES_USED',
        value: '468',
        userSubscriptionUuid: '2-3-4',
      })
    })
  })
})
