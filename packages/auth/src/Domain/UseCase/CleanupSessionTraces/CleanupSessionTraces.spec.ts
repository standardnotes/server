import { SessionTraceRepositoryInterface } from '../../Session/SessionTraceRepositoryInterface'
import { CleanupSessionTraces } from './CleanupSessionTraces'

describe('CleanupSessionTraces', () => {
  let sessionTracesRepository: SessionTraceRepositoryInterface

  const createUseCase = () => new CleanupSessionTraces(sessionTracesRepository)

  beforeEach(() => {
    sessionTracesRepository = {} as jest.Mocked<SessionTraceRepositoryInterface>
    sessionTracesRepository.removeExpiredBefore = jest.fn()
  })

  it('should remove stale session traces', async () => {
    await createUseCase().execute({ date: new Date() })

    expect(sessionTracesRepository.removeExpiredBefore).toHaveBeenCalled()
  })
})
