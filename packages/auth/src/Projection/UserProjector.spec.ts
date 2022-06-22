import 'reflect-metadata'

import { UserProjector } from './UserProjector'
import { User } from '../Domain/User/User'

describe('UserProjector', () => {
  let user: User

  const createProjector = () => new UserProjector()

  beforeEach(() => {
    user = new User()
    user.uuid = '123'
    user.email = 'test@test.te'
    user.encryptedPassword = '123qwe345'
  })

  it('should create a simple projection of a user', () => {
    const projection = createProjector().projectSimple(user)
    expect(projection).toMatchObject({
      uuid: '123',
      email: 'test@test.te',
    })
  })

  it('should throw error on custom projection', () => {
    let error = null
    try {
      createProjector().projectCustom('test', user)
    } catch (e) {
      error = e
    }
    expect(error).not.toBeNull()
  })

  it('should throw error on not implemetned full projection', () => {
    let error = null
    try {
      createProjector().projectFull(user)
    } catch (e) {
      error = e
    }
    expect(error).not.toBeNull()
  })
})
