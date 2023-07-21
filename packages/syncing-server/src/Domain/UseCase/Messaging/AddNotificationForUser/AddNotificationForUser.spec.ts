import { TimerInterface } from '@standardnotes/time'
import { NotificationPayload, NotificationType, Result, Uuid } from '@standardnotes/domain-core'

import { NotificationRepositoryInterface } from '../../../Notifications/NotificationRepositoryInterface'
import { Notification } from '../../../Notifications/Notification'
import { AddNotificationForUser } from './AddNotificationForUser'

describe('AddNotificationForUser', () => {
  let notificationRepository: NotificationRepositoryInterface
  let timer: TimerInterface
  let payload: NotificationPayload

  const createUseCase = () => new AddNotificationForUser(notificationRepository, timer)

  beforeEach(() => {
    notificationRepository = {} as jest.Mocked<NotificationRepositoryInterface>
    notificationRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123456789)

    payload = NotificationPayload.create({
      sharedVaultUuid: Uuid.create('0e8c3c7e-3f1a-4f7a-9b5a-5b2b0a7d4b1e').getValue(),
      type: NotificationType.create(NotificationType.TYPES.RemovedFromSharedVault).getValue(),
      version: '1.0',
    }).getValue()
  })

  it('should save notification', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '0e8c3c7e-3f1a-4f7a-9b5a-5b2b0a7d4b1e',
      type: NotificationType.TYPES.RemovedFromSharedVault,
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should return error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      type: NotificationType.TYPES.RemovedFromSharedVault,
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if notification type is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '0e8c3c7e-3f1a-4f7a-9b5a-5b2b0a7d4b1e',
      type: 'invalid',
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if notification could not be created', async () => {
    const mock = jest.spyOn(Notification, 'create')
    mock.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '0e8c3c7e-3f1a-4f7a-9b5a-5b2b0a7d4b1e',
      type: NotificationType.TYPES.RemovedFromSharedVault,
      payload,
      version: '1.0',
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })
})
