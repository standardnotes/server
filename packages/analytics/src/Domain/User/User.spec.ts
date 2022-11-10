import { Email } from '../Common/Email'
import { User } from './User'

describe('User', () => {
  it('should create an entity', () => {
    const user = User.create({
      email: Email.create('test@test.te').getValue(),
    }).getValue()

    expect(user.id.toString()).toHaveLength(36)
  })
})
