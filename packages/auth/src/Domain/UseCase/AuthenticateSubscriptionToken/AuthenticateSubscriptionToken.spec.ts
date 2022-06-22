import 'reflect-metadata'

import { RoleName } from '@standardnotes/common'

import { SubscriptionTokenRepositoryInterface } from '../../Subscription/SubscriptionTokenRepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { AuthenticateSubscriptionToken } from './AuthenticateSubscriptionToken'

describe('AuthenticateSubscriptionToken', () => {
  let subscriptionTokenRepository: SubscriptionTokenRepositoryInterface
  let userRepository: UserRepositoryInterface
  let user: User

  const createUseCase = () => new AuthenticateSubscriptionToken(subscriptionTokenRepository, userRepository)

  beforeEach(() => {
    subscriptionTokenRepository = {} as jest.Mocked<SubscriptionTokenRepositoryInterface>
    subscriptionTokenRepository.getUserUuidByToken = jest.fn().mockReturnValue('1-2-3')

    user = {
      roles: Promise.resolve([{ name: RoleName.CoreUser }]),
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)
  })

  it('should authenticate an subscription token', async () => {
    const response = await createUseCase().execute({ token: 'test' })

    expect(userRepository.findOneByUuid).toHaveBeenCalledWith('1-2-3')

    expect(response.success).toBeTruthy()

    expect(response.user).toEqual(user)
  })

  it('should not authenticate an subscription token if it is not found', async () => {
    subscriptionTokenRepository.getUserUuidByToken = jest.fn().mockReturnValue(undefined)

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate an subscription token if user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })
})
