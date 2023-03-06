import { SessionRepositoryInterface } from '../../Session/SessionRepositoryInterface'

import { CleanupExpiredSessions } from './CleanupExpiredSessions'

describe('CleanupExpiredSessions', () => {
  let sessionsRepository: SessionRepositoryInterface

  const createUseCase = () => new CleanupExpiredSessions(sessionsRepository)

  beforeEach(() => {
    sessionsRepository = {} as jest.Mocked<SessionRepositoryInterface>
    sessionsRepository.removeExpiredBefore = jest.fn()
  })

  it('should remove stale sessions', async () => {
    await createUseCase().execute({ date: new Date() })

    expect(sessionsRepository.removeExpiredBefore).toHaveBeenCalled()
  })
})
