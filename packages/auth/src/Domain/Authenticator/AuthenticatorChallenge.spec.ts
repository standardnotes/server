import { Uuid } from '@standardnotes/domain-core'

import { AuthenticatorChallenge } from './AuthenticatorChallenge'

describe('AuthenticatorChallenge', () => {
  it('should create an entity', () => {
    const entityOrError = AuthenticatorChallenge.create({
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      createdAt: new Date(1),
      challenge: 'challenge',
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })

  it('should detect expired challenges', () => {
    const challenge = AuthenticatorChallenge.create({
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      createdAt: new Date(Date.now() - 301_000),
      challenge: 'challenge',
    }).getValue()

    expect(challenge.isExpired(300)).toBeTruthy()
    expect(challenge.isExpired(600)).toBeFalsy()
  })
})
