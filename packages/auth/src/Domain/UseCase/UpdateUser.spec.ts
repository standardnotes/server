import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { AuthResponseFactoryInterface } from '../Auth/AuthResponseFactoryInterface'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'

import { UpdateUser } from './UpdateUser'

describe('UpdateUser', () => {
  let userRepository: UserRepositoryInterface
  let authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  let authResponseFactory: AuthResponseFactoryInterface
  let user: User
  let timer: TimerInterface

  const createUseCase = () => new UpdateUser(userRepository, authResponseFactoryResolver, timer)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.save = jest.fn()
    userRepository.findOneByEmail = jest.fn().mockReturnValue(undefined)

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ foo: 'bar' })

    authResponseFactoryResolver = {} as jest.Mocked<AuthResponseFactoryResolverInterface>
    authResponseFactoryResolver.resolveAuthResponseFactoryVersion = jest.fn().mockReturnValue(authResponseFactory)

    user = {} as jest.Mocked<User>
    user.uuid = '123'
    user.email = 'test@test.te'
    user.createdAt = new Date(1)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(1))
  })

  it('should update user fields and save it', async () => {
    expect(
      await createUseCase().execute({
        user,
        updatedWithUserAgent: 'Mozilla',
        apiVersion: '20190520',
        version: '004',
        pwCost: 11,
        pwSalt: 'qweqwe',
        pwNonce: undefined,
      }),
    ).toEqual({ success: true, authResponse: { foo: 'bar' } })

    expect(userRepository.save).toHaveBeenCalledWith({
      createdAt: new Date(1),
      pwCost: 11,
      email: 'test@test.te',
      pwSalt: 'qweqwe',
      updatedWithUserAgent: 'Mozilla',
      uuid: '123',
      version: '004',
      updatedAt: new Date(1),
    })
  })
})
