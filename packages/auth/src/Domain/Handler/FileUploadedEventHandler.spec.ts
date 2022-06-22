import 'reflect-metadata'

import { FileUploadedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { FileUploadedEventHandler } from './FileUploadedEventHandler'
import { SubscriptionSettingServiceInterface } from '../Setting/SubscriptionSettingServiceInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { UserSubscriptionServiceInterface } from '../Subscription/UserSubscriptionServiceInterface'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'

describe('FileUploadedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionService: UserSubscriptionServiceInterface
  let logger: Logger
  let user: User
  let event: FileUploadedEvent
  let subscriptionSettingService: SubscriptionSettingServiceInterface
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription

  const createHandler = () =>
    new FileUploadedEventHandler(userRepository, userSubscriptionService, subscriptionSettingService, logger)

  beforeEach(() => {
    user = {
      uuid: '123',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    regularSubscription = {
      uuid: '1-2-3',
      subscriptionType: UserSubscriptionType.Regular,
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>

    sharedSubscription = {
      uuid: '2-3-4',
      subscriptionType: UserSubscriptionType.Shared,
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>

    userSubscriptionService = {} as jest.Mocked<UserSubscriptionServiceInterface>
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription, sharedSubscription: null })

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue(null)
    subscriptionSettingService.createOrReplace = jest.fn()

    event = {} as jest.Mocked<FileUploadedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      fileByteSize: 123,
      filePath: '1-2-3/2-3-4',
      fileName: '2-3-4',
    }

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
  })

  it('should create a bytes used setting if one does not exist', async () => {
    await createHandler().handle(event)

    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '123',
        serverEncryptionVersion: 0,
      },
      userSubscription: {
        uuid: '1-2-3',
        subscriptionType: 'regular',
        user: Promise.resolve(user),
      },
    })
  })

  it('should not do anything if a user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(subscriptionSettingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should not do anything if a user subscription is not found', async () => {
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: 345,
    })
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription: null, sharedSubscription: null })

    await createHandler().handle(event)

    expect(subscriptionSettingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should update a bytes used setting if one does exist', async () => {
    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: 345,
    })
    await createHandler().handle(event)

    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '468',
        serverEncryptionVersion: 0,
      },
      userSubscription: {
        uuid: '1-2-3',
        subscriptionType: 'regular',
        user: Promise.resolve(user),
      },
    })
  })

  it('should update a bytes used setting on both regular and shared subscription', async () => {
    userSubscriptionService.findRegularSubscriptionForUserUuid = jest
      .fn()
      .mockReturnValue({ regularSubscription, sharedSubscription })

    subscriptionSettingService.findSubscriptionSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: 345,
    })
    await createHandler().handle(event)

    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '468',
        serverEncryptionVersion: 0,
      },
      userSubscription: {
        uuid: '1-2-3',
        subscriptionType: 'regular',
        user: Promise.resolve(user),
      },
    })

    expect(subscriptionSettingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'FILE_UPLOAD_BYTES_USED',
        sensitive: false,
        unencryptedValue: '468',
        serverEncryptionVersion: 0,
      },
      userSubscription: {
        uuid: '2-3-4',
        subscriptionType: 'shared',
        user: Promise.resolve(user),
      },
    })
  })
})
