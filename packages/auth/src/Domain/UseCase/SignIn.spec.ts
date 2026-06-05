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
import { Session } from '../Session/Session'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'
import { VerifyHumanInteraction } from './VerifyHumanInteraction/VerifyHumanInteraction'
import { Result } from '@standardnotes/domain-core'
import { IncreaseLoginAttempts } from './IncreaseLoginAttempts'
import { ClearLoginAttempts } from './ClearLoginAttempts'

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
  let session: Session
  let maxNonCaptchaAttempts: number
  let lockRepository: LockRepositoryInterface
  let verifyHumanInteractionUseCase: VerifyHumanInteraction
  let increaseLoginAttempts: IncreaseLoginAttempts
  let clearLoginAttempts: ClearLoginAttempts
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
      maxNonCaptchaAttempts,
      lockRepository,
      verifyHumanInteractionUseCase,
      increaseLoginAttempts,
      clearLoginAttempts,
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

    session = {} as jest.Mocked<Session>
    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ response: { foo: 'bar' }, session })

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

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.getLockCounter = jest.fn().mockReturnValue(0)

    maxNonCaptchaAttempts = 6

    increaseLoginAttempts = {} as jest.Mocked<IncreaseLoginAttempts>
    increaseLoginAttempts.execute = jest.fn().mockReturnValue(Result.ok({ isNonCaptchaLimitReached: false }))

    clearLoginAttempts = {} as jest.Mocked<ClearLoginAttempts>
    clearLoginAttempts.execute = jest.fn()

    verifyHumanInteractionUseCase = {} as jest.Mocked<VerifyHumanInteraction>
    verifyHumanInteractionUseCase.execute = jest.fn().mockReturnValue(Result.ok())
  })

  const requireHumanVerification = () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(maxNonCaptchaAttempts).mockReturnValueOnce(0)
    verifyHumanInteractionUseCase.execute = jest.fn()
  }

  it('should fail sign in a legacy user without code verifier', async () => {
    pkceRepository.removeCodeChallenge = jest.fn().mockReturnValue(false)

    user.version = ProtocolVersion.V003
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: '',
      }),
    ).toEqual({
      success: false,
      errorCode: 410,
      errorMessage: 'Please update your client application.',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should not sign in 004 user without code verifier', async () => {
    pkceRepository.removeCodeChallenge = jest.fn().mockReturnValue(false)

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: '',
      }),
    ).toEqual({
      success: false,
      errorCode: 410,
      errorMessage: 'Please update your client application.',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should not sign in 005 user without code verifier', async () => {
    pkceRepository.removeCodeChallenge = jest.fn().mockReturnValue(false)

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
        codeVerifier: '',
      }),
    ).toEqual({
      success: false,
      errorCode: 410,
      errorMessage: 'Please update your client application.',
      isNonCaptchaLimitReached: false,
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
      isNonCaptchaLimitReached: false,
    })

    expect(domainEventFactory.createEmailRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not sign in a user with invalid api version', async () => {
    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: 'invalid',
        ephemeralSession: false,
        codeVerifier: 'test',
      }),
    ).toEqual({
      success: false,
      errorMessage: 'Invalid api version: invalid',
      isNonCaptchaLimitReached: false,
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
      result: {
        response: { foo: 'bar' },
        session,
      },
    })

    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(clearLoginAttempts.execute).toHaveBeenCalledWith({ email: 'test@test.te' })
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
      result: {
        response: { foo: 'bar' },
        session,
      },
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
      isNonCaptchaLimitReached: false,
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
      isNonCaptchaLimitReached: false,
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
      isNonCaptchaLimitReached: false,
    })
  })

  it('should sign in a user with valid code verifier and invalid hvm token but not requiring human verification', async () => {
    verifyHumanInteractionUseCase = {} as jest.Mocked<VerifyHumanInteraction>
    verifyHumanInteractionUseCase.execute = jest
      .fn()
      .mockReturnValueOnce(Result.fail('Human verification step failed.'))

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
      result: {
        response: { foo: 'bar' },
        session,
      },
    })
  })

  it('should sign in a user with valid code verifier and valid hvm token requiring human verification', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(maxNonCaptchaAttempts)
    verifyHumanInteractionUseCase = {} as jest.Mocked<VerifyHumanInteraction>
    verifyHumanInteractionUseCase.execute = jest.fn().mockReturnValueOnce(Result.ok())

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: 'test',
        hvmToken: 'foobar',
      }),
    ).toEqual({
      success: true,
      result: {
        response: { foo: 'bar' },
        session,
      },
    })
  })

  it('should not sign in a user with valid code verifier and invalid hvm token requiring human verification', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(maxNonCaptchaAttempts)
    verifyHumanInteractionUseCase = {} as jest.Mocked<VerifyHumanInteraction>
    verifyHumanInteractionUseCase.execute = jest
      .fn()
      .mockReturnValueOnce(Result.fail('Human verification step failed.'))

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'qweqwe123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
        codeVerifier: 'test',
        hvmToken: 'foobar',
      }),
    ).toEqual({
      success: false,
      errorMessage: 'Human verification step failed.',
      isNonCaptchaLimitReached: true,
    })
  })

  it('should return isNonCaptchaLimitReached when incrementing login attempts reaches the limit', async () => {
    increaseLoginAttempts.execute = jest.fn().mockReturnValue(Result.ok({ isNonCaptchaLimitReached: true }))

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
      isNonCaptchaLimitReached: true,
    })
  })

  it('should increment login attempts on invalid password', async () => {
    await createUseCase().execute({
      email: 'test@test.te',
      password: 'asdasd123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520',
      ephemeralSession: false,
      codeVerifier: 'test',
    })

    expect(increaseLoginAttempts.execute).toHaveBeenCalledWith({
      email: 'test@test.te',
      skipUsernameValidation: true,
    })
  })

  it('should not increment login attempts when human verification fails', async () => {
    requireHumanVerification()
    verifyHumanInteractionUseCase.execute = jest
      .fn()
      .mockReturnValueOnce(Result.fail('Human verification step failed.'))

    await createUseCase().execute({
      email: 'test@test.te',
      password: 'qweqwe123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520',
      ephemeralSession: false,
      codeVerifier: 'test',
      hvmToken: 'bad-token',
    })

    expect(increaseLoginAttempts.execute).not.toHaveBeenCalled()
  })

  it('should not increment login attempts when human verification token is missing', async () => {
    requireHumanVerification()
    verifyHumanInteractionUseCase.execute = jest.fn().mockReturnValueOnce(Result.fail('No HVM token available.'))

    await createUseCase().execute({
      email: 'test@test.te',
      password: 'qweqwe123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520',
      ephemeralSession: false,
      codeVerifier: 'test',
    })

    expect(increaseLoginAttempts.execute).not.toHaveBeenCalled()
  })

  it('should not set isNonCaptchaLimitReached when increasing login attempts fails', async () => {
    increaseLoginAttempts.execute = jest.fn().mockReturnValue(Result.fail('invalid email'))

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

  it('should require human verification in captcha mode and not increment on failure', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(1)
    verifyHumanInteractionUseCase.execute = jest
      .fn()
      .mockReturnValueOnce(Result.fail('Human verification step failed.'))

    await createUseCase().execute({
      email: 'test@test.te',
      password: 'qweqwe123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520',
      ephemeralSession: false,
      codeVerifier: 'test',
      hvmToken: 'bad-token',
    })

    expect(increaseLoginAttempts.execute).not.toHaveBeenCalled()
  })

  it('should not increment login attempts on human verification failure for unknown user', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(maxNonCaptchaAttempts).mockReturnValueOnce(0)
    verifyHumanInteractionUseCase.execute = jest.fn().mockReturnValueOnce(Result.fail('No HVM token available.'))

    await createUseCase().execute({
      email: 'test@test.te',
      password: 'asdasd123123',
      userAgent: 'Google Chrome',
      apiVersion: '20190520',
      ephemeralSession: false,
      codeVerifier: 'test',
    })

    expect(increaseLoginAttempts.execute).not.toHaveBeenCalled()
  })
})
