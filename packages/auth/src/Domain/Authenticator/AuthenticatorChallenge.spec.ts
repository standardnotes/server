import { Uuid } from '@standardnotes/domain-core'

import { AuthenticatorChallenge } from './AuthenticatorChallenge'

describe('AuthenticatorChallenge', () => {
  it('should create an entity', () => {
    const entityOrError = AuthenticatorChallenge.create({
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      createdAt: new Date(1),
      challenge: Buffer.from('challenge'),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
