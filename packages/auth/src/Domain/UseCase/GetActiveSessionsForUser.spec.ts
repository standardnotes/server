import 'reflect-metadata'
import { EphemeralSession } from '../Session/EphemeralSession'
import { EphemeralSessionRepositoryInterface } from '../Session/EphemeralSessionRepositoryInterface'
import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'

import { GetActiveSessionsForUser } from './GetActiveSessionsForUser'

describe('GetActiveSessionsForUser', () => {
  let sessionRepository: SessionRepositoryInterface
  let ephemeralSessionRepository: EphemeralSessionRepositoryInterface
  let session1: Session
  let session2: Session
  let ephemeralSession1: EphemeralSession
  let ephemeralSession2: EphemeralSession

  const createUseCase = () => new GetActiveSessionsForUser(sessionRepository, ephemeralSessionRepository)

  beforeEach(() => {
    session1 = {} as jest.Mocked<Session>
    session1.uuid = '1-2-3'
    session1.refreshExpiration = new Date(1)

    session2 = {} as jest.Mocked<Session>
    session2.uuid = '2-3-4'
    session2.refreshExpiration = new Date(2)

    ephemeralSession1 = {} as jest.Mocked<EphemeralSession>
    ephemeralSession1.uuid = '3-4-5'
    ephemeralSession1.refreshExpiration = new Date(3)

    ephemeralSession2 = {} as jest.Mocked<EphemeralSession>
    ephemeralSession2.uuid = '4-5-6'
    ephemeralSession2.refreshExpiration = new Date(4)

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findAllByRefreshExpirationAndUserUuid = jest.fn().mockReturnValue([session1, session2])

    ephemeralSessionRepository = {} as jest.Mocked<EphemeralSessionRepositoryInterface>
    ephemeralSessionRepository.findAllByUserUuid = jest.fn().mockReturnValue([ephemeralSession1, ephemeralSession2])
  })

  it('should get all active sessions for a user', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({
      sessions: [ephemeralSession2, ephemeralSession1, session2, session1],
    })

    expect(sessionRepository.findAllByRefreshExpirationAndUserUuid).toHaveBeenCalledWith('1-2-3')
  })

  it('should get all active sessions for a user from stringified values', async () => {
    const ephemeralSession3: Record<string, unknown> = {}
    ephemeralSession3.uuid = '3-4-5'
    ephemeralSession3.refreshExpiration = '1970-01-01T00:00:00.003Z'

    const ephemeralSession4: Record<string, unknown> = {}
    ephemeralSession4.uuid = '4-5-6'
    ephemeralSession4.refreshExpiration = '1970-01-01T00:00:00.004Z'

    ephemeralSessionRepository.findAllByUserUuid = jest.fn().mockReturnValue([ephemeralSession3, ephemeralSession4])

    expect(await createUseCase().execute({ userUuid: '1-2-3' })).toEqual({
      sessions: [ephemeralSession4, ephemeralSession3, session2, session1],
    })

    expect(sessionRepository.findAllByRefreshExpirationAndUserUuid).toHaveBeenCalledWith('1-2-3')
  })

  it('should get a single session for a user', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', sessionUuid: '2-3-4' })).toEqual({
      sessions: [session2],
    })
  })
})
