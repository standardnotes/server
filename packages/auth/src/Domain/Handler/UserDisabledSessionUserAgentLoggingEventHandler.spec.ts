import 'reflect-metadata'

import { UserDisabledSessionUserAgentLoggingEvent } from '@standardnotes/domain-events'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'

import { UserDisabledSessionUserAgentLoggingEventHandler } from './UserDisabledSessionUserAgentLoggingEventHandler'

describe('UserDisabledSessionUserAgentLoggingEventHandler', () => {
  let sessionRepository: SessionRepositoryInterface
  let event: UserDisabledSessionUserAgentLoggingEvent

  const createHandler = () => new UserDisabledSessionUserAgentLoggingEventHandler(sessionRepository)

  beforeEach(() => {
    sessionRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionRepository.clearUserAgentByUserUuid = jest.fn()

    event = {} as jest.Mocked<UserDisabledSessionUserAgentLoggingEvent>
    event.payload = {
      userUuid: '1-2-3',
      email: 'test@test.te',
    }
  })

  it('should clear all user agent info from all user sessions', async () => {
    await createHandler().handle(event)

    expect(sessionRepository.clearUserAgentByUserUuid).toHaveBeenCalledWith('1-2-3')
  })
})
