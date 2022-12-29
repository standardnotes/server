import { Dates, Uuid } from '@standardnotes/domain-core'

import { Authenticator } from './Authenticator'

describe('Authenticator', () => {
  it('should create an entity', () => {
    const entityOrError = Authenticator.create({
      counter: 1,
      name: 'my-key',
      credentialBackedUp: true,
      credentialDeviceType: 'singleDevice',
      credentialId: Buffer.from('credentialId'),
      credentialPublicKey: Buffer.from('credentialPublicKey'),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      dates: Dates.create(new Date(1), new Date(1)).getValue(),
      transports: ['usb'],
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
