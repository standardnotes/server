import { Logger } from 'winston'
import { EphemeralSession } from '../../Session/EphemeralSession'
import { EphemeralSessionRepositoryInterface } from '../../Session/EphemeralSessionRepositoryInterface'
import { Session } from '../../Session/Session'
import { SessionRepositoryInterface } from '../../Session/SessionRepositoryInterface'
import { SessionService } from '../../Session/SessionService'
import { GetSessionFromToken } from './GetSessionFromToken'
import { ApiVersion } from '../../Api/ApiVersion'
import { GetCooldownSessionTokens } from '../GetCooldownSessionTokens/GetCooldownSessionTokens'
import { Result } from '@standardnotes/domain-core'

describe('GetSessionFromToken', () => {
  let sessionRepository: SessionRepositoryInterface
  let ephemeralSessionRepository: EphemeralSessionRepositoryInterface
  let existingSession: Session
  let existingEphemeralSession: EphemeralSession
  let getCooldownSessionTokens: GetCooldownSessionTokens
  let logger: Logger

  const createUseCase = () =>
    new GetSessionFromToken(sessionRepository, ephemeralSessionRepository, getCooldownSessionTokens, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    existingSession = {} as jest.Mocked<Session>
    existingSession.uuid = '2e1e43'
    existingSession.userUuid = '1-2-3'
    existingSession.userAgent = 'Chrome'
    existingSession.apiVersion = ApiVersion.VERSIONS.v20200115
    existingSession.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingSession.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingSession.readonlyAccess = false
    existingSession.version = SessionService.HEADER_BASED_SESSION_VERSION

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)
    sessionRepository.findOneByPrivateIdentifier = jest.fn().mockReturnValue(null)

    ephemeralSessionRepository = {} as jest.Mocked<EphemeralSessionRepositoryInterface>
    ephemeralSessionRepository.findOneByUuid = jest.fn()
    ephemeralSessionRepository.findOneByPrivateIdentifier = jest.fn()

    existingEphemeralSession = {} as jest.Mocked<EphemeralSession>
    existingEphemeralSession.uuid = '2-3-4'
    existingEphemeralSession.userUuid = '1-2-3'
    existingEphemeralSession.userAgent = 'Mozilla Firefox'
    existingEphemeralSession.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingEphemeralSession.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingEphemeralSession.readonlyAccess = false

    getCooldownSessionTokens = {} as jest.Mocked<GetCooldownSessionTokens>
    getCooldownSessionTokens.execute = jest.fn().mockReturnValue(Result.fail('No tokens found'))
  })

  it('should retrieve a session from a session token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return existingSession
      }

      return null
    })

    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeFalsy()

    const { session, isEphemeral } = result.getValue()

    expect(session).toEqual(session)
    expect(isEphemeral).toBeFalsy()
  })

  it('should retrieve a cookie session from a cookie session token', async () => {
    sessionRepository.findOneByPrivateIdentifier = jest.fn().mockImplementation((privateIdentifier: string) => {
      if (privateIdentifier === '00000000-0000-0000-0000-000000000000') {
        existingSession.privateIdentifier = '00000000-0000-0000-0000-000000000000'
        existingSession.uuid = '00000000-0000-0000-0000-000000000001'
        existingSession.version = SessionService.COOKIE_BASED_SESSION_VERSION

        return existingSession
      }

      return null
    })

    const result = await createUseCase().execute({
      authTokenFromHeaders: '2:00000000-0000-0000-0000-000000000000',
      authCookies: new Map([['access_token_00000000-0000-0000-0000-000000000001', ['3']]]),
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeFalsy()

    const { session, isEphemeral } = result.getValue()

    expect(session).toEqual(session)
    expect(isEphemeral).toBeFalsy()
  })

  it('should retrieve a session by a cooldown access token', async () => {
    sessionRepository.findOneByPrivateIdentifier = jest.fn().mockImplementation((privateIdentifier: string) => {
      if (privateIdentifier === '00000000-0000-0000-0000-000000000000') {
        existingSession.privateIdentifier = '00000000-0000-0000-0000-000000000000'
        existingSession.uuid = '00000000-0000-0000-0000-000000000001'
        existingSession.version = SessionService.COOKIE_BASED_SESSION_VERSION

        return existingSession
      }

      return null
    })

    getCooldownSessionTokens.execute = jest.fn().mockReturnValue(
      Result.ok({
        hashedAccessToken: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
        hashedRefreshToken: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
      }),
    )

    const result = await createUseCase().execute({
      authTokenFromHeaders: '2:00000000-0000-0000-0000-000000000000',
      authCookies: new Map([['access_token_00000000-0000-0000-0000-000000000001', ['2']]]),
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeFalsy()

    const { session, isEphemeral } = result.getValue()

    expect(session).toEqual(session)
    expect(isEphemeral).toBeFalsy()
  })

  it('should not retrieve a header session from a cookie session token', async () => {
    sessionRepository.findOneByPrivateIdentifier = jest.fn().mockImplementation((privateIdentifier: string) => {
      if (privateIdentifier === '00000000-0000-0000-0000-000000000000') {
        existingSession.privateIdentifier = '00000000-0000-0000-0000-000000000000'
        existingSession.uuid = '00000000-0000-0000-0000-000000000001'
        existingSession.version = SessionService.HEADER_BASED_SESSION_VERSION

        return existingSession
      }

      return null
    })

    const result = await createUseCase().execute({
      authTokenFromHeaders: '2:00000000-0000-0000-0000-000000000000',
      authCookies: new Map([['access_token_00000000-0000-0000-0000-000000000001', ['3']]]),
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeTruthy()
  })

  it('should not retrieve a cookie session from a cookie session token that has invalid private identifier', async () => {
    const result = await createUseCase().execute({
      authTokenFromHeaders: '2',
      authCookies: new Map([['access_token_4', ['3']]]),
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeTruthy()
  })

  it('should not retrieve a cookie session from a cookie session token that has an invalid uuid', async () => {
    sessionRepository.findOneByPrivateIdentifier = jest.fn().mockImplementation((privateIdentifier: string) => {
      if (privateIdentifier === '00000000-0000-0000-0000-000000000000') {
        existingSession.privateIdentifier = '00000000-0000-0000-0000-000000000000'
        existingSession.uuid = '00000000-0000-0000-0000-000000000002'
        existingSession.version = SessionService.COOKIE_BASED_SESSION_VERSION

        return existingSession
      }

      return null
    })

    const result = await createUseCase().execute({
      authTokenFromHeaders: '2:00000000-0000-0000-0000-000000000000',
      authCookies: new Map([['access_token_00000000-0000-0000-0000-000000000001', ['3']]]),
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeTruthy()
  })

  it('should not retrieve a cookie session if cookies are missing', async () => {
    sessionRepository.findOneByPrivateIdentifier = jest.fn().mockImplementation((privateIdentifier: string) => {
      if (privateIdentifier === '00000000-0000-0000-0000-000000000000') {
        existingSession.privateIdentifier = '00000000-0000-0000-0000-000000000000'
        existingSession.uuid = '00000000-0000-0000-0000-000000000001'
        existingSession.version = SessionService.COOKIE_BASED_SESSION_VERSION

        return existingSession
      }

      return null
    })

    const result1 = await createUseCase().execute({
      authTokenFromHeaders: '2:00000000-0000-0000-0000-000000000000',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result1.isFailed()).toBeTruthy()

    const result2 = await createUseCase().execute({
      authTokenFromHeaders: '2:00000000-0000-0000-0000-000000000000',
      authCookies: new Map([]),
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result2.isFailed()).toBeTruthy()
  })

  it('should retrieve an ephemeral session from a session token', async () => {
    ephemeralSessionRepository.findOneByUuid = jest.fn().mockReturnValue(existingEphemeralSession)
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeFalsy()

    const { session, isEphemeral } = result.getValue()

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

    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:2',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeTruthy()
  })

  it('should not retrieve a session that is missing', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeTruthy()
  })

  it('should not retrieve a session from a session token that has invalid access token', async () => {
    sessionRepository.findOneByUuid = jest.fn().mockImplementation((uuid) => {
      if (uuid === '2') {
        return existingSession
      }

      return null
    })

    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:2:4',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeTruthy()
  })
})
