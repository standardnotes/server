import 'reflect-metadata'

import { AnalyticsEntity } from '../../Entity/AnalyticsEntity'
import { AnalyticsEntityRepositoryInterface } from '../../Entity/AnalyticsEntityRepositoryInterface'

import { GetUserAnalyticsId } from './GetUserAnalyticsId'

describe('GetUserAnalyticsId', () => {
  let analyticsEntityRepository: AnalyticsEntityRepositoryInterface
  let analyticsEntity: AnalyticsEntity

  const createUseCase = () => new GetUserAnalyticsId(analyticsEntityRepository)

  beforeEach(() => {
    analyticsEntity = {
      id: 123,
      userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d',
      username: 'test@test.te',
    } as jest.Mocked<AnalyticsEntity>

    analyticsEntityRepository = {} as jest.Mocked<AnalyticsEntityRepositoryInterface>
    analyticsEntityRepository.findOneByUserUuid = jest.fn().mockReturnValue(analyticsEntity)
    analyticsEntityRepository.findOneByUserEmail = jest.fn().mockReturnValue(analyticsEntity)
  })

  it('should return analytics id for a user by uuid', async () => {
    expect((await createUseCase().execute({ userUuid: '1-2-3' })).analyticsId).toEqual(123)
  })

  it('should return analytics id for a user by email', async () => {
    expect((await createUseCase().execute({ userEmail: 'test@test.te' })).analyticsId).toEqual(123)
  })

  it('should throw error if user is missing analytics entity', async () => {
    analyticsEntityRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)
    let error = null

    try {
      await createUseCase().execute({ userUuid: '1-2-3' })
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })
})
