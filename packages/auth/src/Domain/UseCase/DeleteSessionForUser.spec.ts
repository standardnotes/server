import 'reflect-metadata'
import { EphemeralSession } from '../Session/EphemeralSession'
import { EphemeralSessionRepositoryInterface } from '../Session/EphemeralSessionRepositoryInterface'

import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'

import { DeleteSessionForUser } from './DeleteSessionForUser'

describe('DeleteSessionForUser', () => {
  let sessionRepository: SessionRepositoryInterface
  let ephemeralSessionRepository: EphemeralSessionRepositoryInterface
  let sessionService: SessionServiceInterface
  let session: Session
  let ephemeralSession: EphemeralSession

  const createUseCase = () => new DeleteSessionForUser(sessionRepository, ephemeralSessionRepository, sessionService)

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '2-3-4'
    session.userUuid = '1-2-3'

    ephemeralSession = {} as jest.Mocked<EphemeralSession>
    ephemeralSession.uuid = '2-3-4'
    ephemeralSession.userUuid = '1-2-3'

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.deleteOneByUuid = jest.fn()
    sessionRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(session)

    ephemeralSessionRepository = {} as jest.Mocked<EphemeralSessionRepositoryInterface>
    ephemeralSessionRepository.deleteOne = jest.fn()
    ephemeralSessionRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(session)

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.createRevokedSession = jest.fn()
  })

  it('should delete a session for a given user', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', sessionUuid: '2-3-4' })).toEqual({ success: true })

    expect(sessionRepository.deleteOneByUuid).toHaveBeenCalledWith('2-3-4')
    expect(ephemeralSessionRepository.deleteOne).toHaveBeenCalledWith('2-3-4', '1-2-3')
    expect(sessionService.createRevokedSession).toHaveBeenCalledWith(session)
  })

  it('should delete an ephemeral session for a given user', async () => {
    sessionRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ userUuid: '1-2-3', sessionUuid: '2-3-4' })).toEqual({ success: true })

    expect(sessionRepository.deleteOneByUuid).toHaveBeenCalledWith('2-3-4')
    expect(ephemeralSessionRepository.deleteOne).toHaveBeenCalledWith('2-3-4', '1-2-3')
    expect(sessionService.createRevokedSession).toHaveBeenCalledWith(session)
  })

  it('should not delete a session if it does not exist for a given user', async () => {
    sessionRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(null)
    ephemeralSessionRepository.findOneByUuidAndUserUuid = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ userUuid: '1-2-3', sessionUuid: '2-3-4' })).toEqual({
      success: false,
      errorMessage: 'No session exists with the provided identifier.',
    })

    expect(sessionRepository.deleteOneByUuid).not.toHaveBeenCalled()
    expect(ephemeralSessionRepository.deleteOne).not.toHaveBeenCalled()
    expect(sessionService.createRevokedSession).not.toHaveBeenCalled()
  })
})
