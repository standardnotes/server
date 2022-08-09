import 'reflect-metadata'
import { UserRegisteredEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { UserRegisteredEventHandler } from './UserRegisteredEventHandler'
import { AxiosInstance } from 'axios'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsStoreInterface } from '@standardnotes/analytics'

describe('UserRegisteredEventHandler', () => {
  let httpClient: AxiosInstance
  const userServerRegistrationUrl = 'https://user-server/registration'
  const userServerAuthKey = 'auth-key'
  let event: UserRegisteredEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let logger: Logger

  const createHandler = () =>
    new UserRegisteredEventHandler(
      httpClient,
      userServerRegistrationUrl,
      userServerAuthKey,
      getUserAnalyticsId,
      analyticsStore,
      logger,
    )

  beforeEach(() => {
    httpClient = {} as jest.Mocked<AxiosInstance>
    httpClient.request = jest.fn()

    event = {} as jest.Mocked<UserRegisteredEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      email: 'test@test.te',
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should send a request to the user management server about a registration', async () => {
    await createHandler().handle(event)

    expect(httpClient.request).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://user-server/registration',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        key: 'auth-key',
        user: {
          created_at: new Date(1),
          email: 'test@test.te',
        },
      },
      validateStatus: expect.any(Function),
    })
  })

  it('should not send a request to the user management server about a registration if url is not defined', async () => {
    const handler = new UserRegisteredEventHandler(
      httpClient,
      '',
      userServerAuthKey,
      getUserAnalyticsId,
      analyticsStore,
      logger,
    )
    await handler.handle(event)

    expect(httpClient.request).not.toHaveBeenCalled()
  })
})
