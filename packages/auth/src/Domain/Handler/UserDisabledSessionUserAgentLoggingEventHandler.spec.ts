import 'reflect-metadata'

import { UserDisabledSessionUserAgentLoggingEvent } from '@standardnotes/domain-events'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'

import { UserDisabledSessionUserAgentLoggingEventHandler } from './UserDisabledSessionUserAgentLoggingEventHandler'
import { RevokedSessionRepositoryInterface } from '../Session/RevokedSessionRepositoryInterface'

describe('UserDisabledSessionUserAgentLoggingEventHandler', () => {
  let sessionRepository: SessionRepositoryInterface
  let revokedSessionRepository: RevokedSessionRepositoryInterface
  let event: UserDisabledSessionUserAgentLoggingEvent

  const createHandler = () =>
    new UserDisabledSessionUserAgentLoggingEventHandler(sessionRepository, revokedSessionRepository)

  beforeEach(() => {
    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.clearUserAgentByUserUuid = jest.fn()

    revokedSessionRepository = {} as jest.Mocked<RevokedSessionRepositoryInterface>
    revokedSessionRepository.clearUserAgentByUserUuid = jest.fn()

    event = {} as jest.Mocked<UserDisabledSessionUserAgentLoggingEvent>
    event.payload = {
      userUuid: '1-2-3',
      email: 'test@test.te',
    }
  })

  it('should clear all user agent info from all user sessions', async () => {
    await createHandler().handle(event)

    expect(sessionRepository.clearUserAgentByUserUuid).toHaveBeenCalledWith('1-2-3')
    expect(revokedSessionRepository.clearUserAgentByUserUuid).toHaveBeenCalledWith('1-2-3')
  })
})
