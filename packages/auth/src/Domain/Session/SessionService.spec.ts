import 'reflect-metadata'
import * as winston from 'winston'
import { TimerInterface } from '@standardnotes/time'

import { ApiVersion } from '../Api/ApiVersion'
import { Session } from './Session'
import { SessionRepositoryInterface } from './SessionRepositoryInterface'
import { SessionService } from './SessionService'
import { User } from '../User/User'
import { EphemeralSessionRepositoryInterface } from './EphemeralSessionRepositoryInterface'
import { EphemeralSession } from './EphemeralSession'
import { RevokedSessionRepositoryInterface } from './RevokedSessionRepositoryInterface'
import { RevokedSession } from './RevokedSession'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { LogSessionUserAgentOption } from '@standardnotes/settings'
import { Setting } from '../Setting/Setting'
import { CryptoNode } from '@standardnotes/sncrypto-node'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { TraceSession } from '../UseCase/TraceSession/TraceSession'
import { UserSubscription } from '../Subscription/UserSubscription'
import { Result } from '@standardnotes/domain-core'

describe('SessionService', () => {
  let sessionRepository: SessionRepositoryInterface
  let ephemeralSessionRepository: EphemeralSessionRepositoryInterface
  let revokedSessionRepository: RevokedSessionRepositoryInterface
  let existingSession: Session
  let existingEphemeralSession: EphemeralSession
  let revokedSession: RevokedSession
  let settingService: SettingServiceInterface
  let deviceDetector: UAParser
  let timer: TimerInterface
  let logger: winston.Logger
  let cryptoNode: CryptoNode
  let traceSession: TraceSession
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  const readonlyUsers = ['demo@standardnotes.com']

  const createService = () =>
    new SessionService(
      sessionRepository,
      ephemeralSessionRepository,
      revokedSessionRepository,
      deviceDetector,
      timer,
      logger,
      123,
      234,
      settingService,
      cryptoNode,
      traceSession,
      userSubscriptionRepository,
      readonlyUsers,
    )

  beforeEach(() => {
    existingSession = {} as jest.Mocked<Session>
    existingSession.uuid = '2e1e43'
    existingSession.userUuid = '1-2-3'
    existingSession.userAgent = 'Chrome'
    existingSession.apiVersion = ApiVersion.v20200115
    existingSession.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingSession.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingSession.readonlyAccess = false

    revokedSession = {} as jest.Mocked<RevokedSession>
    revokedSession.uuid = '2e1e43'

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)
    sessionRepository.deleteOneByUuid = jest.fn()
    sessionRepository.insert = jest.fn()
    sessionRepository.update = jest.fn()

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    ephemeralSessionRepository = {} as jest.Mocked<EphemeralSessionRepositoryInterface>
    ephemeralSessionRepository.insert = jest.fn()
    ephemeralSessionRepository.update = jest.fn()
    ephemeralSessionRepository.findOneByUuid = jest.fn()
    ephemeralSessionRepository.deleteOne = jest.fn()

    revokedSessionRepository = {} as jest.Mocked<RevokedSessionRepositoryInterface>
    revokedSessionRepository.insert = jest.fn()
    revokedSessionRepository.update = jest.fn()

    existingEphemeralSession = {} as jest.Mocked<EphemeralSession>
    existingEphemeralSession.uuid = '2-3-4'
    existingEphemeralSession.userUuid = '1-2-3'
    existingEphemeralSession.userAgent = 'Mozilla Firefox'
    existingEphemeralSession.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingEphemeralSession.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingEphemeralSession.readonlyAccess = false

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertStringDateToMilliseconds = jest.fn().mockReturnValue(123)
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(1))

    deviceDetector = {} as jest.Mocked<UAParser>
    deviceDetector.setUA = jest.fn().mockReturnThis()
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
      browser: {
        name: 'Chrome',
        version: '69.0',
      },
      os: {
        name: 'Mac',
        version: '10.13',
      },
    })

    logger = {} as jest.Mocked<winston.Logger>
    logger.warn = jest.fn()
    logger.error = jest.fn()
    logger.debug = jest.fn()

    cryptoNode = {} as jest.Mocked<CryptoNode>
    cryptoNode.generateRandomKey = jest.fn().mockReturnValue('foo bar')
    cryptoNode.base64URLEncode = jest.fn().mockReturnValue('foobar')

    traceSession = {} as jest.Mocked<TraceSession>
    traceSession.execute = jest.fn()

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue({
      planName: 'PRO_PLAN',
    } as jest.Mocked<UserSubscription>)
  })

  it('should mark a revoked session as received', async () => {
    await createService().markRevokedSessionAsReceived(revokedSession)

    expect(revokedSessionRepository.update).toHaveBeenCalledWith({
      uuid: '2e1e43',
      received: true,
      receivedAt: new Date(1),
    })
  })

  it('should refresh access and refresh tokens for a session', async () => {
    expect(await createService().refreshTokens({ session: existingSession, isEphemeral: false })).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      refresh_expiration: 123,
      readonly_access: false,
    })

    expect(sessionRepository.update).toHaveBeenCalled()
    expect(ephemeralSessionRepository.update).not.toHaveBeenCalled()
  })

  it('should refresh access and refresh tokens for an ephemeral session', async () => {
    expect(await createService().refreshTokens({ session: existingEphemeralSession, isEphemeral: true })).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      refresh_expiration: 123,
      readonly_access: false,
    })

    expect(sessionRepository.update).not.toHaveBeenCalled()
    expect(ephemeralSessionRepository.update).toHaveBeenCalled()
  })

  it('should create new session for a user', async () => {
    const user = {} as jest.Mocked<User>
    user.uuid = '123'

    const result = await createService().createNewSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(sessionRepository.insert).toHaveBeenCalledWith(expect.any(Session))
    expect(sessionRepository.insert).toHaveBeenCalledWith({
      accessExpiration: expect.any(Date),
      apiVersion: '003',
      createdAt: expect.any(Date),
      hashedAccessToken: expect.any(String),
      hashedRefreshToken: expect.any(String),
      refreshExpiration: expect.any(Date),
      updatedAt: expect.any(Date),
      userAgent: 'Google Chrome',
      userUuid: '123',
      uuid: expect.any(String),
      readonlyAccess: false,
    })

    expect(result.sessionHttpRepresentation).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_expiration: 123,
      refresh_token: expect.any(String),
      readonly_access: false,
    })
  })

  it('should create new readonly session for a user that is readonly restricted', async () => {
    const user = {} as jest.Mocked<User>
    user.email = 'demo@standardnotes.com'
    user.uuid = '123'

    const result = await createService().createNewSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(sessionRepository.insert).toHaveBeenCalledWith(expect.any(Session))
    expect(sessionRepository.insert).toHaveBeenCalledWith({
      accessExpiration: expect.any(Date),
      apiVersion: '003',
      createdAt: expect.any(Date),
      hashedAccessToken: expect.any(String),
      hashedRefreshToken: expect.any(String),
      refreshExpiration: expect.any(Date),
      updatedAt: expect.any(Date),
      userAgent: 'Google Chrome',
      userUuid: '123',
      uuid: expect.any(String),
      readonlyAccess: true,
    })

    expect(result.sessionHttpRepresentation).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_expiration: 123,
      refresh_token: expect.any(String),
      readonly_access: true,
    })
  })

  it('should create new session for a user with disabled user agent logging', async () => {
    const user = {} as jest.Mocked<User>
    user.uuid = '123'

    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue({
      value: LogSessionUserAgentOption.Disabled,
    } as jest.Mocked<Setting>)

    const result = await createService().createNewSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(sessionRepository.insert).toHaveBeenCalledWith(expect.any(Session))
    expect(sessionRepository.insert).toHaveBeenCalledWith({
      accessExpiration: expect.any(Date),
      apiVersion: '003',
      createdAt: expect.any(Date),
      hashedAccessToken: expect.any(String),
      hashedRefreshToken: expect.any(String),
      refreshExpiration: expect.any(Date),
      updatedAt: expect.any(Date),
      userUuid: '123',
      uuid: expect.any(String),
      readonlyAccess: false,
    })

    expect(result.sessionHttpRepresentation).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_expiration: 123,
      refresh_token: expect.any(String),
      readonly_access: false,
    })
  })

  it('should trace a session', async () => {
    const user = {} as jest.Mocked<User>
    user.uuid = '123'
    user.email = 'test@test.te'

    await createService().createNewSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(traceSession.execute).toHaveBeenCalledWith({
      userUuid: '123',
      username: 'test@test.te',
      subscriptionPlanName: 'PRO_PLAN',
    })
  })

  it('should trace a session without a subscription', async () => {
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)
    const user = {} as jest.Mocked<User>
    user.uuid = '123'
    user.email = 'test@test.te'

    await createService().createNewSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(traceSession.execute).toHaveBeenCalledWith({
      userUuid: '123',
      username: 'test@test.te',
      subscriptionPlanName: null,
    })
  })

  it('should create a session if tracing session throws an error', async () => {
    traceSession.execute = jest.fn().mockRejectedValue(new Error('foo bar'))
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)
    const user = {} as jest.Mocked<User>
    user.uuid = '123'
    user.email = 'test@test.te'

    const result = await createService().createNewSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(traceSession.execute).toHaveBeenCalledWith({
      userUuid: '123',
      username: 'test@test.te',
      subscriptionPlanName: null,
    })
    expect(result.sessionHttpRepresentation).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_expiration: 123,
      refresh_token: expect.any(String),
      readonly_access: false,
    })
  })

  it('should create a session if tracing session throws an error', async () => {
    traceSession.execute = jest.fn().mockRejectedValue(new Error('foo bar'))
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)
    const user = {} as jest.Mocked<User>
    user.uuid = '123'
    user.email = 'test@test.te'

    const result = await createService().createNewSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(traceSession.execute).toHaveBeenCalledWith({
      userUuid: '123',
      username: 'test@test.te',
      subscriptionPlanName: null,
    })
    expect(result.sessionHttpRepresentation).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_expiration: 123,
      refresh_token: expect.any(String),
      readonly_access: false,
    })
  })

  it('should create a session if tracing session fails', async () => {
    traceSession.execute = jest.fn().mockReturnValue(Result.fail('Oops'))
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)
    const user = {} as jest.Mocked<User>
    user.uuid = '123'
    user.email = 'test@test.te'

    const result = await createService().createNewSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(traceSession.execute).toHaveBeenCalledWith({
      userUuid: '123',
      username: 'test@test.te',
      subscriptionPlanName: null,
    })
    expect(result.sessionHttpRepresentation).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_expiration: 123,
      refresh_token: expect.any(String),
      readonly_access: false,
    })
  })

  it('should create new ephemeral session for a user', async () => {
    const user = {} as jest.Mocked<User>
    user.uuid = '123'

    const result = await createService().createNewEphemeralSessionForUser({
      user,
      apiVersion: '003',
      userAgent: 'Google Chrome',
      readonlyAccess: false,
    })

    expect(ephemeralSessionRepository.insert).toHaveBeenCalledWith(expect.any(EphemeralSession))
    expect(ephemeralSessionRepository.insert).toHaveBeenCalledWith({
      accessExpiration: expect.any(Date),
      apiVersion: '003',
      createdAt: expect.any(Date),
      hashedAccessToken: expect.any(String),
      hashedRefreshToken: expect.any(String),
      refreshExpiration: expect.any(Date),
      updatedAt: expect.any(Date),
      userAgent: 'Google Chrome',
      userUuid: '123',
      uuid: expect.any(String),
      readonlyAccess: false,
    })

    expect(result.sessionHttpRepresentation).toEqual({
      access_expiration: 123,
      access_token: expect.any(String),
      refresh_expiration: 123,
      refresh_token: expect.any(String),
      readonly_access: false,
    })
  })

  it('should delete a session by token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return existingSession
      }

      return null
    })

    await createService().deleteSessionByToken('1:2:3')

    expect(sessionRepository.deleteOneByUuid).toHaveBeenCalledWith('2e1e43')
    expect(ephemeralSessionRepository.deleteOne).not.toHaveBeenCalled()
  })

  it('should delete an ephemeral session by token', async () => {
    ephemeralSessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return existingEphemeralSession
      }

      return null
    })

    await createService().deleteSessionByToken('1:2:3')

    expect(sessionRepository.deleteOneByUuid).not.toHaveBeenCalled()
    expect(ephemeralSessionRepository.deleteOne).toHaveBeenCalledWith('2-3-4', '1-2-3')
  })

  it('should not delete a session by token if session is not found', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return existingSession
      }

      return null
    })

    await createService().deleteSessionByToken('1:4:3')

    expect(sessionRepository.deleteOneByUuid).not.toHaveBeenCalled()
    expect(ephemeralSessionRepository.deleteOne).not.toHaveBeenCalled()
  })

  it('should determine if a refresh token is valid', async () => {
    expect(createService().isRefreshTokenMatchingHashedSessionToken(existingSession, '1:2:3')).toBeTruthy()
    expect(createService().isRefreshTokenMatchingHashedSessionToken(existingSession, '1:2:4')).toBeFalsy()
    expect(createService().isRefreshTokenMatchingHashedSessionToken(existingSession, '1:2')).toBeFalsy()
  })

  it('should return device info based on user agent', () => {
    expect(createService().getDeviceInfo(existingSession)).toEqual('Chrome 69.0 on Mac 10.13')
  })

  it('should return device info based on undefined user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: '',
      browser: { name: undefined, version: undefined },
      os: { name: undefined, version: undefined },
    })
    expect(createService().getDeviceInfo(existingSession)).toEqual('Unknown Client on Unknown OS')
  })

  it('should return a shorter info based on lack of client in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'dummy-data',
      browser: { name: '', version: '' },
      os: { name: 'iOS', version: '10.3' },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('iOS 10.3')
  })

  it('should return a shorter info based on lack of os in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'dummy-data',
      browser: { name: 'Chrome', version: '69.0' },
      os: { name: '', version: '' },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('Chrome 69.0')
  })

  it('should return unknown client and os if user agent is cleaned out', () => {
    existingSession.userAgent = null

    expect(createService().getDeviceInfo(existingSession)).toEqual('Unknown Client on Unknown OS')
  })

  it('should return a shorter info based on partial os in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'dummy-data',
      browser: { name: 'Chrome', version: '69.0' },
      os: { name: 'Windows', version: '' },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('Chrome 69.0 on Windows')

    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'dummy-data',
      browser: { name: 'Chrome', version: '69.0' },
      os: { name: '', version: '7' },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('Chrome 69.0 on 7')
  })

  it('should return a shorter info based on partial client in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'dummy-data',
      browser: { name: '', version: '69.0' },
      os: { name: 'Windows', version: '7' },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('69.0 on Windows 7')

    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'dummy-data',
      browser: { name: 'Chrome', version: '' },
      os: { name: 'Windows', version: '7' },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('Chrome on Windows 7')
  })

  it('should return a shorter info based on iOS agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'StandardNotes/41 CFNetwork/1220.1 Darwin/20.3.0',
      browser: { name: undefined, version: undefined, major: undefined },
      engine: { name: undefined, version: undefined },
      os: { name: 'iOS', version: undefined },
      device: { vendor: undefined, model: undefined, type: undefined },
      cpu: { architecture: undefined },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('iOS')
  })

  it('should return a shorter info based on partial client and partial os in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'dummy-data',
      browser: { name: '', version: '69.0' },
      os: { name: 'Windows', version: '' },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('69.0 on Windows')

    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'dummy-data',
      browser: { name: 'Chrome', version: '' },
      os: { name: '', version: '7' },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('Chrome on 7')
  })

  it('should return only Android os for okHttp client', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'okhttp/3.12.12',
      browser: { name: undefined, version: undefined, major: undefined },
      engine: { name: undefined, version: undefined },
      os: { name: undefined, version: undefined },
      device: { vendor: undefined, model: undefined, type: undefined },
      cpu: { architecture: undefined },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('Android')
  })

  it('should detect the StandardNotes app in user agent', () => {
    deviceDetector.getResult = jest.fn().mockReturnValue({
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_16_0) AppleWebKit/537.36 (KHTML, like Gecko) StandardNotes/3.5.18 Chrome/83.0.4103.122 Electron/9.2.1 Safari/537.36',
      browser: { name: 'Chrome', version: '83.0.4103.122', major: '83' },
      engine: { name: 'Blink', version: '83.0.4103.122' },
      os: { name: 'Mac OS', version: '10.16.0' },
      device: { vendor: undefined, model: undefined, type: undefined },
      cpu: { architecture: undefined },
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('Standard Notes Desktop 3.5.18 on Mac OS 10.16.0')
  })

  it('should return unknown device info as fallback', () => {
    deviceDetector.getResult = jest.fn().mockImplementation(() => {
      throw new Error('something bad happened')
    })

    expect(createService().getDeviceInfo(existingSession)).toEqual('Unknown Client on Unknown OS')
  })

  it('should retrieve a session from a session token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return existingSession
      }

      return null
    })

    const { session, isEphemeral } = await createService().getSessionFromToken('1:2:3')

    expect(session).toEqual(session)
    expect(isEphemeral).toBeFalsy()
  })

  it('should retrieve an ephemeral session from a session token', async () => {
    ephemeralSessionRepository.findOneByUuid = jest.fn().mockReturnValue(existingEphemeralSession)
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const { session, isEphemeral } = await createService().getSessionFromToken('1:2:3')

    expect(session).toEqual(existingEphemeralSession)
    expect(isEphemeral).toBeTruthy()
  })

  it('should not retrieve a session from a session token that has access token missing', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return existingSession
      }

      return null
    })

    const { session } = await createService().getSessionFromToken('1:2')

    expect(session).toBeUndefined()
  })

  it('should not retrieve a session that is missing', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const { session } = await createService().getSessionFromToken('1:2:3')

    expect(session).toBeUndefined()
  })

  it('should not retrieve a session from a session token that has invalid access token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return existingSession
      }

      return null
    })

    const { session } = await createService().getSessionFromToken('1:2:4')

    expect(session).toBeUndefined()
  })

  it('should revoked a session', async () => {
    await createService().createRevokedSession(existingSession)

    expect(revokedSessionRepository.insert).toHaveBeenCalledWith({
      uuid: '2e1e43',
      userUuid: '1-2-3',
      userAgent: 'Chrome',
      apiVersion: '20200115',
      createdAt: expect.any(Date),
    })
  })

  it('should retrieve an archvied session from a session token', async () => {
    revokedSessionRepository.findOneByUuid = jest.fn().mockReturnValue(revokedSession)

    const result = await createService().getRevokedSessionFromToken('1:2:3')

    expect(result).toEqual(revokedSession)
  })

  it('should not retrieve an archvied session if session id is missing from token', async () => {
    revokedSessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createService().getRevokedSessionFromToken('1::3')

    expect(result).toBeNull()
  })
})
