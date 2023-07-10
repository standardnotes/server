import { Timestamps, Uuid } from '@standardnotes/domain-core'

import { Message } from './Message'

describe('Message', () => {
  it('should create an entity', () => {
    const entityOrError = Message.create({
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      recipientUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      senderUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      encryptedMessage: 'encryptedMessage',
      replaceabilityIdentifier: 'replaceabilityIdentifier',
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
