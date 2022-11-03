import 'reflect-metadata'

import { ExitDiscountAppliedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { JobRepositoryInterface } from '../Job/JobRepositoryInterface'

import { ExitDiscountAppliedEventHandler } from './ExitDiscountAppliedEventHandler'

describe('ExitDiscountAppliedEventHandler', () => {
  let timer: TimerInterface
  let jobRepository: JobRepositoryInterface

  const createHandler = () => new ExitDiscountAppliedEventHandler(timer, jobRepository)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDateNHoursAhead = jest.fn().mockReturnValue(new Date(2))
    timer.convertDateToMicroseconds = jest.fn().mockReturnValue(123)
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)

    jobRepository = {} as jest.Mocked<JobRepositoryInterface>
    jobRepository.save = jest.fn()
  })

  it('should schedule a job to do an exit discount withdrawal', async () => {
    await createHandler().handle({
      payload: { userEmail: 'test@test.te', discountRate: 20 },
    } as jest.Mocked<ExitDiscountAppliedEvent>)

    expect(jobRepository.save).toHaveBeenNthCalledWith(1, {
      createdAt: 1,
      name: 'withdraw-subscription-exit-discount',
      scheduledAt: 123,
      status: 'pending',
      userIdentifier: 'test@test.te',
      userIdentifierType: 'email',
    })
  })
})
