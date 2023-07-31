import 'reflect-metadata'

import { AccountDeletionRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { EphemeralSession } from '../Session/EphemeralSession'
import { EphemeralSessionRepositoryInterface } from '../Session/EphemeralSessionRepositoryInterface'
import { RevokedSession } from '../Session/RevokedSession'
import { RevokedSessionRepositoryInterface } from '../Session/RevokedSessionRepositoryInterface'
import { Session } from '../Session/Session'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { AccountDeletionRequestedEventHandler } from './AccountDeletionRequestedEventHandler'

describe('AccountDeletionRequestedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let sessionRepository: SessionRepositoryInterface
  let ephemeralSessionRepository: EphemeralSessionRepositoryInterface
  let revokedSessionRepository: RevokedSessionRepositoryInterface
  let logger: Logger
  let session: Session
  let ephemeralSession: EphemeralSession
  let revokedSession: RevokedSession
  let user: User
  let event: AccountDeletionRequestedEvent

  const createHandler = () =>
    new AccountDeletionRequestedEventHandler(
      userRepository,
      sessionRepository,
      ephemeralSessionRepository,
      revokedSessionRepository,
      logger,
    )

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)
    userRepository.remove = jest.fn()

    session = {
      uuid: '1-2-3',
    } as jest.Mocked<Session>

    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.findAllByUserUuid = jest.fn().mockReturnValue([session])
    sessionRepository.remove = jest.fn()

    ephemeralSession = {
      uuid: '2-3-4',
      userUuid: '00000000-0000-0000-0000-000000000000',
    } as jest.Mocked<EphemeralSession>

    ephemeralSessionRepository = {} as jest.Mocked<EphemeralSessionRepositoryInterface>
    ephemeralSessionRepository.findAllByUserUuid = jest.fn().mockReturnValue([ephemeralSession])
    ephemeralSessionRepository.deleteOne = jest.fn()

    revokedSession = {
      uuid: '3-4-5',
    } as jest.Mocked<RevokedSession>

    revokedSessionRepository = {} as jest.Mocked<RevokedSessionRepositoryInterface>
    revokedSessionRepository.findAllByUserUuid = jest.fn().mockReturnValue([revokedSession])
    revokedSessionRepository.remove = jest.fn()

    event = {} as jest.Mocked<AccountDeletionRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '00000000-0000-0000-0000-000000000000',
      userCreatedAtTimestamp: 1,
      regularSubscriptionUuid: '2-3-4',
    }

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
  })

  it('should remove a user', async () => {
    await createHandler().handle(event)

    expect(userRepository.remove).toHaveBeenCalledWith(user)
  })

  it('should not remove a user with invalid uuid', async () => {
    event.payload.userUuid = 'invalid'

    await createHandler().handle(event)

    expect(userRepository.remove).not.toHaveBeenCalled()
  })

  it('should not remove a user if one does not exist', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(userRepository.remove).not.toHaveBeenCalled()
    expect(sessionRepository.remove).not.toHaveBeenCalled()
    expect(revokedSessionRepository.remove).not.toHaveBeenCalled()
    expect(ephemeralSessionRepository.deleteOne).not.toHaveBeenCalled()
  })

  it('should remove all user sessions', async () => {
    await createHandler().handle(event)

    expect(sessionRepository.remove).toHaveBeenCalledWith(session)
    expect(revokedSessionRepository.remove).toHaveBeenCalledWith(revokedSession)
    expect(ephemeralSessionRepository.deleteOne).toHaveBeenCalledWith('2-3-4', '00000000-0000-0000-0000-000000000000')
  })
})
