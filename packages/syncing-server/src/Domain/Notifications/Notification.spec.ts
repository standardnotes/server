import { NotificationPayload, NotificationType, Timestamps, Uuid } from '@standardnotes/domain-core'

import { Notification } from './Notification'

describe('Notification', () => {
  it('should create an entity', () => {
    const payload = NotificationPayload.create({
      sharedVaultUuid: Uuid.create('0e8c3c7e-3f1a-4f7a-9b5a-5b2b0a7d4b1e').getValue(),
      type: NotificationType.create(NotificationType.TYPES.SelfRemovedFromSharedVault).getValue(),
      version: '1.0',
    }).getValue()

    const entityOrError = Notification.create({
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      payload,
      type: NotificationType.create(NotificationType.TYPES.SharedVaultItemRemoved).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
