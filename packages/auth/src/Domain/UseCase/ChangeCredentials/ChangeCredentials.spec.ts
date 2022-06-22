import 'reflect-metadata'

import { DomainEventPublisherInterface, UserEmailChangedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { AuthResponseFactoryInterface } from '../../Auth/AuthResponseFactoryInterface'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

import { AuthResponseFactoryResolverInterface } from '../../Auth/AuthResponseFactoryResolverInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { ChangeCredentials } from './ChangeCredentials'

describe('ChangeCredentials', () => {
  let userRepository: UserRepositoryInterface
  let authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  let authResponseFactory: AuthResponseFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let timer: TimerInterface
  let user: User

  const createUseCase = () =>
    new ChangeCredentials(userRepository, authResponseFactoryResolver, domainEventPublisher, domainEventFactory, timer)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.save = jest.fn()

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ foo: 'bar' })

    authResponseFactoryResolver = {} as jest.Mocked<AuthResponseFactoryResolverInterface>
    authResponseFactoryResolver.resolveAuthResponseFactoryVersion = jest.fn().mockReturnValue(authResponseFactory)

    user = {} as jest.Mocked<User>
    user.encryptedPassword = '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a'
    user.uuid = '1-2-3'
    user.email = 'test@test.te'

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createUserEmailChangedEvent = jest.fn().mockReturnValue({} as jest.Mocked<UserEmailChangedEvent>)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(1))
  })

  it('should change password', async () => {
    expect(
      await createUseCase().execute({
        user,
        apiVersion: '20190520',
        currentPassword: 'qweqwe123123',
        newPassword: 'test234',
        pwNonce: 'asdzxc',
        updatedWithUserAgent: 'Google Chrome',
        kpCreated: '123',
        kpOrigination: 'password-change',
      }),
    ).toEqual({
      success: true,
      authResponse: {
        foo: 'bar',
      },
    })

    expect(userRepository.save).toHaveBeenCalledWith({
      encryptedPassword: expect.any(String),
      pwNonce: 'asdzxc',
      kpCreated: '123',
      email: 'test@test.te',
      uuid: '1-2-3',
      kpOrigination: 'password-change',
      updatedAt: new Date(1),
    })
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createUserEmailChangedEvent).not.toHaveBeenCalled()
  })

  it('should change email', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        user,
        apiVersion: '20190520',
        currentPassword: 'qweqwe123123',
        newPassword: 'test234',
        newEmail: 'new@test.te',
        pwNonce: 'asdzxc',
        updatedWithUserAgent: 'Google Chrome',
        kpCreated: '123',
        kpOrigination: 'password-change',
      }),
    ).toEqual({
      success: true,
      authResponse: {
        foo: 'bar',
      },
    })

    expect(userRepository.save).toHaveBeenCalledWith({
      encryptedPassword: expect.any(String),
      email: 'new@test.te',
      uuid: '1-2-3',
      pwNonce: 'asdzxc',
      kpCreated: '123',
      kpOrigination: 'password-change',
      updatedAt: new Date(1),
    })
    expect(domainEventFactory.createUserEmailChangedEvent).toHaveBeenCalledWith('1-2-3', 'test@test.te', 'new@test.te')
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not change email if already taken', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue({} as jest.Mocked<User>)

    expect(
      await createUseCase().execute({
        user,
        apiVersion: '20190520',
        currentPassword: 'qweqwe123123',
        newPassword: 'test234',
        newEmail: 'new@test.te',
        pwNonce: 'asdzxc',
        updatedWithUserAgent: 'Google Chrome',
        kpCreated: '123',
        kpOrigination: 'password-change',
      }),
    ).toEqual({
      success: false,
      errorMessage: 'The email you entered is already taken. Please try again.',
    })

    expect(userRepository.save).not.toHaveBeenCalled()
    expect(domainEventFactory.createUserEmailChangedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not change password if current password is incorrect', async () => {
    expect(
      await createUseCase().execute({
        user,
        apiVersion: '20190520',
        currentPassword: 'test123',
        newPassword: 'test234',
        pwNonce: 'asdzxc',
        updatedWithUserAgent: 'Google Chrome',
      }),
    ).toEqual({
      success: false,
      errorMessage: 'The current password you entered is incorrect. Please try again.',
    })

    expect(userRepository.save).not.toHaveBeenCalled()
  })

  it('should update protocol version while changing password', async () => {
    expect(
      await createUseCase().execute({
        user,
        apiVersion: '20190520',
        currentPassword: 'qweqwe123123',
        newPassword: 'test234',
        pwNonce: 'asdzxc',
        updatedWithUserAgent: 'Google Chrome',
        protocolVersion: '004',
      }),
    ).toEqual({
      success: true,
      authResponse: {
        foo: 'bar',
      },
    })

    expect(userRepository.save).toHaveBeenCalledWith({
      encryptedPassword: expect.any(String),
      pwNonce: 'asdzxc',
      version: '004',
      email: 'test@test.te',
      uuid: '1-2-3',
      updatedAt: new Date(1),
    })
  })
})
