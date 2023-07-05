import { Timestamps, Uuid } from '@standardnotes/domain-core'

import { Notification } from './Notification'
import { NotificationType } from './NotificationType'

describe('Notification', () => {
  it('should create an entity', () => {
    const entityOrError = Notification.create({
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      payload: 'payload',
      type: NotificationType.create(NotificationType.TYPES.SharedVaultItemRemoved).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
