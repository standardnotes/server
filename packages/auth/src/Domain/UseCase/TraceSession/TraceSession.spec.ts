import { Result } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { SessionTrace } from '../../Session/SessionTrace'
import { SessionTraceRepositoryInterface } from '../../Session/SessionTraceRepositoryInterface'
import { TraceSession } from './TraceSession'

describe('TraceSession', () => {
  let sessionTraceRepository: SessionTraceRepositoryInterface
  let timer: TimerInterface
  const sessionTraceDaysTTL = 90

  const createUseCase = () => new TraceSession(sessionTraceRepository, timer, sessionTraceDaysTTL)

  beforeEach(() => {
    sessionTraceRepository = {} as jest.Mocked<SessionTraceRepositoryInterface>
    sessionTraceRepository.findOneByUserUuidAndDate = jest.fn().mockReturnValue(null)
    sessionTraceRepository.insert = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDateNDaysAhead = jest.fn().mockReturnValue(new Date())
  })

  it('should save a session trace', async () => {
    const result = await createUseCase().execute({
      userUuid: '0702b137-4f5c-438a-915e-8f8b46572ce5',
      username: 'username',
      subscriptionPlanName: 'PRO_PLAN',
    })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue().props.userUuid.value).toEqual('0702b137-4f5c-438a-915e-8f8b46572ce5')
    expect(sessionTraceRepository.insert).toHaveBeenCalledTimes(1)
  })

  it('should not save a session trace if one already exists for the same user and date', async () => {
    sessionTraceRepository.findOneByUserUuidAndDate = jest.fn().mockReturnValue({} as jest.Mocked<SessionTrace>)

    const result = await createUseCase().execute({
      userUuid: '0702b137-4f5c-438a-915e-8f8b46572ce5',
      username: 'username',
      subscriptionPlanName: null,
    })

    expect(result.isFailed()).toBe(false)
    expect(sessionTraceRepository.insert).not.toHaveBeenCalled()
  })

  it('should return an error if userUuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      username: 'username',
      subscriptionPlanName: 'PRO_PLAN',
    })

    expect(result.isFailed()).toBe(true)
    expect(sessionTraceRepository.insert).not.toHaveBeenCalled()
  })

  it('should return an error if username is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '0702b137-4f5c-438a-915e-8f8b46572ce5',
      username: '',
      subscriptionPlanName: 'PRO_PLAN',
    })

    expect(result.isFailed()).toBe(true)
    expect(sessionTraceRepository.insert).not.toHaveBeenCalled()
  })

  it('should return an error if subscriptionPlanName is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '0702b137-4f5c-438a-915e-8f8b46572ce5',
      username: 'username',
      subscriptionPlanName: 'foobar',
    })

    expect(result.isFailed()).toBe(true)
    expect(sessionTraceRepository.insert).not.toHaveBeenCalled()
  })

  it('should not save a session trace if creating of the session trace fails', async () => {
    const mock = jest.spyOn(SessionTrace, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

    const result = await createUseCase().execute({
      userUuid: '0702b137-4f5c-438a-915e-8f8b46572ce5',
      username: 'username',
      subscriptionPlanName: 'PRO_PLAN',
    })

    expect(result.isFailed()).toBe(true)
    expect(sessionTraceRepository.insert).not.toHaveBeenCalled()

    mock.mockRestore()
  })
})
