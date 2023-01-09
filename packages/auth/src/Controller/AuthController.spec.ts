import 'reflect-metadata'

import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { AuthController } from './AuthController'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { User } from '../Domain/User/User'
import { Register } from '../Domain/UseCase/Register'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { KeyParamsOrigination, ProtocolVersion } from '@standardnotes/common'
import { ApiVersion } from '@standardnotes/api'
import { SignInWithRecoveryCodes } from '../Domain/UseCase/SignInWithRecoveryCodes/SignInWithRecoveryCodes'
import { GetUserKeyParamsRecovery } from '../Domain/UseCase/GetUserKeyParamsRecovery/GetUserKeyParamsRecovery'
import { GenerateRecoveryCodes } from '../Domain/UseCase/GenerateRecoveryCodes/GenerateRecoveryCodes'
import { Logger } from 'winston'

describe('AuthController', () => {
  let clearLoginAttempts: ClearLoginAttempts
  let register: Register
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let event: DomainEventInterface
  let user: User
  let doSignInWithRecoveryCodes: SignInWithRecoveryCodes
  let getUserKeyParamsRecovery: GetUserKeyParamsRecovery
  let doGenerateRecoveryCodes: GenerateRecoveryCodes
  let logger: Logger

  const createController = () =>
    new AuthController(
      clearLoginAttempts,
      register,
      domainEventPublisher,
      domainEventFactory,
      doSignInWithRecoveryCodes,
      getUserKeyParamsRecovery,
      doGenerateRecoveryCodes,
      logger,
    )

  beforeEach(() => {
    register = {} as jest.Mocked<Register>
    register.execute = jest.fn()

    user = {} as jest.Mocked<User>
    user.email = 'test@test.te'

    clearLoginAttempts = {} as jest.Mocked<ClearLoginAttempts>
    clearLoginAttempts.execute = jest.fn()

    event = {} as jest.Mocked<DomainEventInterface>

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createUserRegisteredEvent = jest.fn().mockReturnValue(event)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should register a user', async () => {
    register.execute = jest.fn().mockReturnValue({ success: true, authResponse: { user } })

    const response = await createController().register({
      email: 'test@test.te',
      password: 'asdzxc',
      version: ProtocolVersion.V004,
      api: ApiVersion.v0,
      origination: KeyParamsOrigination.Registration,
      userAgent: 'Google Chrome',
      identifier: 'test@test.te',
      pw_nonce: '11',
      ephemeral: false,
    })

    expect(register.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      kpOrigination: 'registration',
      updatedWithUserAgent: 'Google Chrome',
      ephemeralSession: false,
      version: '004',
      email: 'test@test.te',
      password: 'asdzxc',
      pwNonce: '11',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalledWith(event)

    expect(response.status).toEqual(200)
    expect(response.data).toEqual({ user: { email: 'test@test.te' } })
  })

  it('should not register a user if request param is missing', async () => {
    const response = await createController().register({
      email: 'test@test.te',
      password: '',
      version: ProtocolVersion.V004,
      api: ApiVersion.v0,
      origination: KeyParamsOrigination.Registration,
      userAgent: 'Google Chrome',
      identifier: 'test@test.te',
      pw_nonce: '11',
      ephemeral: false,
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()

    expect(response.status).toEqual(400)
  })

  it('should respond with error if registering a user fails', async () => {
    register.execute = jest.fn().mockReturnValue({ success: false, errorMessage: 'Something bad happened' })

    const response = await createController().register({
      email: 'test@test.te',
      password: 'test',
      version: ProtocolVersion.V004,
      api: ApiVersion.v0,
      origination: KeyParamsOrigination.Registration,
      userAgent: 'Google Chrome',
      identifier: 'test@test.te',
      pw_nonce: '11',
      ephemeral: false,
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()

    expect(response.status).toEqual(400)
  })

  it('should throw error on the delete user method as it is still a part of the payments server', async () => {
    let caughtError = null
    try {
      await createController().deleteAccount({} as never)
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.toBeNull()
  })
})
