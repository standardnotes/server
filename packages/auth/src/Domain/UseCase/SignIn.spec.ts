import 'reflect-metadata'

import { DomainEventPublisherInterface, EmailRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { AuthResponseFactoryInterface } from '../Auth/AuthResponseFactoryInterface'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SignIn } from './SignIn'
import { PKCERepositoryInterface } from '../User/PKCERepositoryInterface'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { ProtocolVersion } from '@standardnotes/common'

describe('SignIn', () => {
  let user: User
  let userRepository: UserRepositoryInterface
  let authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  let authResponseFactory: AuthResponseFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let sessionService: SessionServiceInterface
  let logger: Logger
  let pkceRepository: PKCERepositoryInterface
  let crypter: CrypterInterface

  const createUseCase = () =>
    new SignIn(
      userRepository,
      authResponseFactoryResolver,
      domainEventPublisher,
      domainEventFactory,
      sessionService,
      pkceRepository,
      crypter,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '1-2-3',
      email: 'test@test.com',
      version: ProtocolVersion.V004,
    } as jest.Mocked<User>
    user.encryptedPassword = '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ foo: 'bar' })

    authResponseFactoryResolver = {} as jest.Mocked<AuthResponseFactoryResolverInterface>
    authResponseFactoryResolver.resolveAuthResponseFactoryVersion = jest.fn().mockReturnValue(authResponseFactory)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createEmailRequestedEvent = jest.fn().mockReturnValue({} as jest.Mocked<EmailRequestedEvent>)

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.getOperatingSystemInfoFromUserAgent = jest.fn().mockReturnValue('iOS 1')
    sessionService.getBrowserInfoFromUserAgent = jest.fn().mockReturnValue('Firefox 1')

    pkceRepository = {} as jest.Mocked<PKCERepositoryInterface>
    pkceRepository.removeCodeChallenge = jest.fn().mockReturnValue(true)

    crypter = {} as jest.Mocked<CrypterInterface>
    crypter.base64URLEncode = jest.fn().mockReturnValue('base64-url-encoded')
    crypter.sha256Hash = jest.fn().mockReturnValue('sha256-hashed')

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should sign in a legacy user without code verifier', async () => {
    user.version = ProtocolVersion.V003
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
      }),
    ).toEqual({
      success: true,
      authResponse: { foo: 'bar' },
    })

    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not sign in 004 user without code verifier', async () => {
    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
      }),
    ).toEqual({
      success: false,
      errorCode: 410,
      errorMessage: 'Please update your client application.',
    })
  })

  it('should not sign in 005 user without code verifier', async () => {
    user = {
      uuid: '1-2-3',
      email: 'test@test.com',
      version: '005',
    } as jest.Mocked<User>

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
      }),
    ).toEqual({
      success: false,
      errorCode: 410,
      errorMessage: 'Please update your client application.',
    })
  })

  it('should not sign in a user with invalid username', async () => {
    expect(
      await createUseCase().execute({
        email: '  ',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: 'test',
      }),
    ).toEqual({
      success: false,
      errorMessage: 'Username cannot be empty',
    })

    expect(domainEventFactory.createEmailRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should sign in a user with valid code verifier', async () => {
    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: 'test',
      }),
    ).toEqual({
      success: true,
      authResponse: { foo: 'bar' },
    })

    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should sign in a user even if publishing a sign in event fails', async () => {
    domainEventPublisher.publish = jest.fn().mockImplementation(() => {
      throw new Error('Oops')
    })

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: 'test',
      }),
    ).toEqual({
      success: true,
      authResponse: { foo: 'bar' },
    })
  })

  it('should not sign in a user with wrong credentials', async () => {
    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'asdasd123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: 'test',
      }),
    ).toEqual({
      success: false,
      errorMessage: 'Invalid email or password',
    })
  })

  it('should not sign in a user with invalid code verifier', async () => {
    pkceRepository.removeCodeChallenge = jest.fn().mockReturnValue(false)

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: 'test',
      }),
    ).toEqual({
      success: false,
      errorMessage: 'Invalid email or password',
    })
  })

  it('should not sign in a user that does not exist', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'asdasd123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: 'test',
      }),
    ).toEqual({
      success: false,
      errorMessage: 'Invalid email or password',
    })
  })
})
