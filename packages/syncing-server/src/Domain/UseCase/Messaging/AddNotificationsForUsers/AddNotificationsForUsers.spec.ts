import {
  SharedVaultUserPermission,
  Uuid,
  Timestamps,
  Result,
  NotificationPayload,
  NotificationType,
  SharedVaultUser,
} from '@standardnotes/domain-core'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { AddNotificationForUser } from '../AddNotificationForUser/AddNotificationForUser'
import { AddNotificationsForUsers } from './AddNotificationsForUsers'

describe('AddNotificationsForUsers', () => {
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let addNotificationForUser: AddNotificationForUser
  let sharedVaultUser: SharedVaultUser
  let payload: NotificationPayload

  const createUseCase = () => new AddNotificationsForUsers(sharedVaultUserRepository, addNotificationForUser)

  beforeEach(() => {
    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
      isDesignatedSurvivor: false,
    }).getValue()

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findBySharedVaultUuid = jest.fn().mockResolvedValue([sharedVaultUser])

    addNotificationForUser = {} as jest.Mocked<AddNotificationForUser>
    addNotificationForUser.execute = jest.fn().mockResolvedValue(Result.ok())

    payload = NotificationPayload.create({
      sharedVaultUuid: Uuid.create('0e8c3c7e-3f1a-4f7a-9b5a-5b2b0a7d4b1e').getValue(),
      type: NotificationType.create(NotificationType.TYPES.SharedVaultFileUploaded).getValue(),
      version: '1.0',
    }).getValue()
  })

  it('should add notifications for all users in a shared vault', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      type: 'test',
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(addNotificationForUser.execute).toHaveBeenCalledTimes(1)
  })

  it('should not add notification for exceptUserUuid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      exceptUserUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      type: 'test',
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(addNotificationForUser.execute).toHaveBeenCalledTimes(0)
  })

  it('should return error if exceptUserUuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      exceptUserUuid: 'invalid',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      type: 'test',
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid',
      type: 'test',
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if adding notification fails', async () => {
    const useCase = createUseCase()
    addNotificationForUser.execute = jest.fn().mockResolvedValue(Result.fail('test'))

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      type: 'test',
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
