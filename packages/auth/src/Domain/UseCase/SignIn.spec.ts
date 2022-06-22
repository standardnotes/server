import 'reflect-metadata'

import { DomainEventPublisherInterface, UserSignedInEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { AuthResponseFactoryInterface } from '../Auth/AuthResponseFactoryInterface'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SignIn } from './SignIn'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { Setting } from '../Setting/Setting'
import { MuteSignInEmailsOption } from '@standardnotes/settings'
import { PKCERepositoryInterface } from '../User/PKCERepositoryInterface'
import { CrypterInterface } from '../Encryption/CrypterInterface'

describe('SignIn', () => {
  let user: User
  let userRepository: UserRepositoryInterface
  let authResponseFactoryResolver: AuthResponseFactoryResolverInterface
  let authResponseFactory: AuthResponseFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let sessionService: SessionServiceInterface
  let roleService: RoleServiceInterface
  let logger: Logger
  let settingService: SettingServiceInterface
  let setting: Setting
  let pkceRepository: PKCERepositoryInterface
  let crypter: CrypterInterface

  const createUseCase = () =>
    new SignIn(
      userRepository,
      authResponseFactoryResolver,
      domainEventPublisher,
      domainEventFactory,
      sessionService,
      roleService,
      settingService,
      pkceRepository,
      crypter,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '1-2-3',
      email: 'test@test.com',
    } as jest.Mocked<User>
    user.encryptedPassword = '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    authResponseFactory = {} as jest.Mocked<AuthResponseFactoryInterface>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ foo: 'bar' })

    authResponseFactoryResolver = {} as jest.Mocked<AuthResponseFactoryResolverInterface>
    authResponseFactoryResolver.resolveAuthResponseFactoryVersion = jest.fn().mockReturnValue(authResponseFactory)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createUserSignedInEvent = jest.fn().mockReturnValue({} as jest.Mocked<UserSignedInEvent>)

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.getOperatingSystemInfoFromUserAgent = jest.fn().mockReturnValue('iOS 1')
    sessionService.getBrowserInfoFromUserAgent = jest.fn().mockReturnValue('Firefox 1')

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.userHasPermission = jest.fn().mockReturnValue(true)

    setting = {
      uuid: '3-4-5',
      value: MuteSignInEmailsOption.NotMuted,
    } as jest.Mocked<Setting>

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)
    settingService.createOrReplace = jest.fn().mockReturnValue({
      status: 'created',
      setting,
    })

    pkceRepository = {} as jest.Mocked<PKCERepositoryInterface>
    pkceRepository.removeCodeChallenge = jest.fn().mockReturnValue(true)

    crypter = {} as jest.Mocked<CrypterInterface>
    crypter.base64URLEncode = jest.fn().mockReturnValue('base64-url-encoded')
    crypter.sha256Hash = jest.fn().mockReturnValue('sha256-hashed')

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should sign in a user', async () => {
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

    expect(domainEventFactory.createUserSignedInEvent).toHaveBeenCalledWith({
      browser: 'Firefox 1',
      device: 'iOS 1',
      userEmail: 'test@test.com',
      userUuid: '1-2-3',
      signInAlertEnabled: true,
      muteSignInEmailsSettingUuid: '3-4-5',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
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

    expect(domainEventFactory.createUserSignedInEvent).toHaveBeenCalledWith({
      browser: 'Firefox 1',
      device: 'iOS 1',
      userEmail: 'test@test.com',
      userUuid: '1-2-3',
      signInAlertEnabled: true,
      muteSignInEmailsSettingUuid: '3-4-5',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should sign in a user and disable sign in alert if setting is configured', async () => {
    setting = {
      uuid: '3-4-5',
      value: MuteSignInEmailsOption.Muted,
    } as jest.Mocked<Setting>

    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

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

    expect(domainEventFactory.createUserSignedInEvent).toHaveBeenCalledWith({
      browser: 'Firefox 1',
      device: 'iOS 1',
      userEmail: 'test@test.com',
      userUuid: '1-2-3',
      signInAlertEnabled: false,
      muteSignInEmailsSettingUuid: '3-4-5',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should sign in a user and create mute sign in email setting if it does not exist', async () => {
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

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

    expect(domainEventFactory.createUserSignedInEvent).toHaveBeenCalledWith({
      browser: 'Firefox 1',
      device: 'iOS 1',
      userEmail: 'test@test.com',
      userUuid: '1-2-3',
      signInAlertEnabled: true,
      muteSignInEmailsSettingUuid: '3-4-5',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(settingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'MUTE_SIGN_IN_EMAILS',
        sensitive: false,
        serverEncryptionVersion: 0,
        unencryptedValue: 'not_muted',
      },
      user: {
        email: 'test@test.com',
        encryptedPassword: '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a',
        uuid: '1-2-3',
      },
    })
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
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        email: 'test@test.te',
        password: 'asdasd123123',
        userAgent: 'Google Chrome',
        apiVersion: '20190520',
        ephemeralSession: false,
      }),
    ).toEqual({
      success: false,
      errorMessage: 'Invalid email or password',
    })
  })
})
