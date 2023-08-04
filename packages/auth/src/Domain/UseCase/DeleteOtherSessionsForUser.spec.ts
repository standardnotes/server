import 'reflect-metadata'

import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'

import { DeleteOtherSessionsForUser } from './DeleteOtherSessionsForUser'

describe('DeleteOtherSessionsForUser', () => {
  let sessionRepository: SessionRepositoryInterface
  let sessionService: SessionServiceInterface
  let session: Session
  let currentSession: Session

  const createUseCase = () => new DeleteOtherSessionsForUser(sessionRepository, sessionService)

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '00000000-0000-0000-0000-000000000000'

    currentSession = {} as jest.Mocked<Session>
    currentSession.uuid = '00000000-0000-0000-0000-000000000001'

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.deleteAllByUserUuidExceptOne = jest.fn()
    sessionRepository.findAllByUserUuid = jest.fn().mockReturnValue([session, currentSession])

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.createRevokedSession = jest.fn()
  })

  it('should delete all sessions except current for a given user', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      currentSessionUuid: '00000000-0000-0000-0000-000000000001',
      markAsRevoked: true,
    })
    expect(result.isFailed()).toBeFalsy()

    expect(sessionRepository.deleteAllByUserUuidExceptOne).toHaveBeenCalled()

    expect(sessionService.createRevokedSession).toHaveBeenCalledWith(session)
    expect(sessionService.createRevokedSession).not.toHaveBeenCalledWith(currentSession)
  })

  it('should delete all sessions except current for a given user without marking as revoked', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      currentSessionUuid: '00000000-0000-0000-0000-000000000001',
      markAsRevoked: false,
    })
    expect(result.isFailed()).toBeFalsy()

    expect(sessionRepository.deleteAllByUserUuidExceptOne).toHaveBeenCalled()

    expect(sessionService.createRevokedSession).not.toHaveBeenCalled()
  })

  it('should not delete any sessions if the user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      currentSessionUuid: '00000000-0000-0000-0000-000000000001',
      markAsRevoked: true,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(sessionRepository.deleteAllByUserUuidExceptOne).not.toHaveBeenCalled()
    expect(sessionService.createRevokedSession).not.toHaveBeenCalled()
  })

  it('should not delete any sessions if the current session uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      currentSessionUuid: 'invalid',
      markAsRevoked: true,
    })
    expect(result.isFailed()).toBeTruthy()

    expect(sessionRepository.deleteAllByUserUuidExceptOne).not.toHaveBeenCalled()
    expect(sessionService.createRevokedSession).not.toHaveBeenCalled()
  })
})
