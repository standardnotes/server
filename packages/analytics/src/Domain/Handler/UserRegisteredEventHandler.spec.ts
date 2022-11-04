import 'reflect-metadata'

import { UserRegisteredEvent } from '@standardnotes/domain-events'
import { ProtocolVersion } from '@standardnotes/common'

import { UserRegisteredEventHandler } from './UserRegisteredEventHandler'
import { AnalyticsEntityRepositoryInterface } from '../Entity/AnalyticsEntityRepositoryInterface'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { Period } from '../Time/Period'

describe('UserRegisteredEventHandler', () => {
  let analyticsEntityRepository: AnalyticsEntityRepositoryInterface
  let event: UserRegisteredEvent
  let analyticsStore: AnalyticsStoreInterface

  const createHandler = () => new UserRegisteredEventHandler(analyticsEntityRepository, analyticsStore)

  beforeEach(() => {
    event = {} as jest.Mocked<UserRegisteredEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      email: 'test@test.te',
      protocolVersion: ProtocolVersion.V004,
    }

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    analyticsEntityRepository = {} as jest.Mocked<AnalyticsEntityRepositoryInterface>
    analyticsEntityRepository.save = jest.fn().mockImplementation((entity) => ({
      ...entity,
      id: 1,
    }))
  })

  it('should save analytics entity upon user registration', async () => {
    await createHandler().handle(event)

    expect(analyticsEntityRepository.save).toHaveBeenCalled()
    expect(analyticsStore.markActivity).toHaveBeenCalledWith(['register'], 1, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  })
})
