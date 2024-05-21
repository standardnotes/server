import { Result } from '@standardnotes/domain-core'
import { EphemeralSessionRepositoryInterface } from '../../Session/EphemeralSessionRepositoryInterface'
import { SessionRepositoryInterface } from '../../Session/SessionRepositoryInterface'
import { GetSessionFromToken } from '../GetSessionFromToken/GetSessionFromToken'
import { DeleteSessionByToken } from './DeleteSessionByToken'
import { Session } from '../../Session/Session'
import { ApiVersion } from '../../Api/ApiVersion'
import { SessionService } from '../../Session/SessionService'
import { EphemeralSession } from '../../Session/EphemeralSession'

describe('DeleteSessionByToken', () => {
  let getSessionFromToken: GetSessionFromToken
  let sessionRepository: SessionRepositoryInterface
  let ephemeralSessionRepository: EphemeralSessionRepositoryInterface
  let existingSession: Session
  let existingEphemeralSession: EphemeralSession

  const createUseCase = () =>
    new DeleteSessionByToken(getSessionFromToken, sessionRepository, ephemeralSessionRepository)

  beforeEach(() => {
    existingSession = {} as jest.Mocked<Session>
    existingSession.uuid = '2e1e43'
    existingSession.userUuid = '1-2-3'
    existingSession.userAgent = 'Chrome'
    existingSession.apiVersion = ApiVersion.VERSIONS.v20200115
    existingSession.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingSession.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingSession.readonlyAccess = false
    existingSession.version = SessionService.HEADER_BASED_SESSION_VERSION

    existingEphemeralSession = {} as jest.Mocked<EphemeralSession>
    existingEphemeralSession.uuid = '2-3-4'
    existingEphemeralSession.userUuid = '1-2-3'
    existingEphemeralSession.userAgent = 'Mozilla Firefox'
    existingEphemeralSession.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingEphemeralSession.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    existingEphemeralSession.readonlyAccess = false

    ephemeralSessionRepository = {} as jest.Mocked<EphemeralSessionRepositoryInterface>
    ephemeralSessionRepository.deleteOne = jest.fn()

    getSessionFromToken = {} as jest.Mocked<GetSessionFromToken>
    getSessionFromToken.execute = jest.fn().mockResolvedValue(Result.ok({ session: existingSession }))

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.deleteOneByUuid = jest.fn()
  })

  it('should delete a session by token', async () => {
    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(result.isFailed()).toBeFalsy()

    expect(sessionRepository.deleteOneByUuid).toHaveBeenCalledWith('2e1e43')
    expect(ephemeralSessionRepository.deleteOne).not.toHaveBeenCalled()
  })

  it('should delete an ephemeral session by token', async () => {
    getSessionFromToken.execute = jest
      .fn()
      .mockResolvedValue(Result.ok({ session: existingEphemeralSession, isEphemeral: true }))

    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(result.isFailed()).toBeFalsy()

    expect(sessionRepository.deleteOneByUuid).not.toHaveBeenCalled()
    expect(ephemeralSessionRepository.deleteOne).toHaveBeenCalledWith('2-3-4', '1-2-3')
  })

  it('should not delete a session by token if session is not found', async () => {
    getSessionFromToken.execute = jest.fn().mockResolvedValue(Result.fail('Session not found'))

    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:4:3',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })
    expect(result.isFailed()).toBeTruthy()

    expect(sessionRepository.deleteOneByUuid).not.toHaveBeenCalled()
    expect(ephemeralSessionRepository.deleteOne).not.toHaveBeenCalled()
  })
})
