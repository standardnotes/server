import { NotificationPayload, NotificationType, Timestamps, Uuid } from '@standardnotes/domain-core'

import { NotificationRepositoryInterface } from '../../../Notifications/NotificationRepositoryInterface'
import { RemoveNotificationsForUser } from './RemoveNotificationsForUser'
import { Notification } from '../../../Notifications/Notification'

describe('RemoveNotificationsForUser', () => {
  let notificationRepository: NotificationRepositoryInterface
  let notification: Notification

  const createUseCase = () => new RemoveNotificationsForUser(notificationRepository)

  beforeEach(() => {
    notification = Notification.create({
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      type: NotificationType.create(NotificationType.TYPES.SharedVaultItemRemoved).getValue(),
      payload: NotificationPayload.create({
        itemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        type: NotificationType.create(NotificationType.TYPES.SharedVaultItemRemoved).getValue(),
        version: '1.0',
      }).getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    notificationRepository = {} as jest.Mocked<NotificationRepositoryInterface>
    notificationRepository.findByUserUuidAndType = jest.fn().mockResolvedValue([notification])
    notificationRepository.remove = jest.fn()
  })

  it('should remove notifications for user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      type: NotificationType.TYPES.SharedVaultItemRemoved,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(notificationRepository.remove).toHaveBeenCalledWith(notification)
  })

  it('should fail if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      type: NotificationType.TYPES.SharedVaultItemRemoved,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if notification type is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      type: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
