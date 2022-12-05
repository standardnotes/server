import { Username } from '@standardnotes/domain-core'

import { User } from './User'

describe('User', () => {
  it('should create an entity', () => {
    const user = User.create({
      username: Username.create('test@test.te').getValue(),
    }).getValue()

    expect(user.id.toString()).toHaveLength(36)
  })
})
