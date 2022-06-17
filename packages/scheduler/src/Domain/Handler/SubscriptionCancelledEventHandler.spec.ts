import 'reflect-metadata'

import { SubscriptionCancelledEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { JobRepositoryInterface } from '../Job/JobRepositoryInterface'

import { SubscriptionCancelledEventHandler } from './SubscriptionCancelledEventHandler'

describe('SubscriptionCancelledEventHandler', () => {
  let timer: TimerInterface
  let jobRepository: JobRepositoryInterface

  const createHandler = () => new SubscriptionCancelledEventHandler(timer, jobRepository)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDateNHoursAhead = jest.fn().mockReturnValue(new Date(2))
    timer.convertDateToMicroseconds = jest.fn().mockReturnValue(123)
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)

    jobRepository = {} as jest.Mocked<JobRepositoryInterface>
    jobRepository.save = jest.fn()
  })

  it('should schedule a job to do an exit interview', async () => {
    await createHandler().handle({ payload: { userEmail: 'test@test.te' } } as jest.Mocked<SubscriptionCancelledEvent>)

    expect(jobRepository.save).toHaveBeenNthCalledWith(1, {
      createdAt: 1,
      name: 'exit-interview',
      scheduledAt: 123,
      status: 'pending',
      userIdentifier: 'test@test.te',
      userIdentifierType: 'email',
    })
  })
})
