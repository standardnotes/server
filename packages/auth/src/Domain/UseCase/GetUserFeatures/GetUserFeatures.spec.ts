import 'reflect-metadata'
import { FeatureDescription } from '@standardnotes/features'
import { RoleName } from '@standardnotes/domain-core'

import { GetUserFeatures } from './GetUserFeatures'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { User } from '../../User/User'
import { FeatureServiceInterface } from '../../Feature/FeatureServiceInterface'

describe('GetUserFeatures', () => {
  let user: User
  let userRepository: UserRepositoryInterface
  let feature1: FeatureDescription
  let featureService: FeatureServiceInterface

  const createUseCase = () => new GetUserFeatures(userRepository, featureService)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    feature1 = { name: 'foobar' } as jest.Mocked<FeatureDescription>
    featureService = {} as jest.Mocked<FeatureServiceInterface>
    featureService.getFeaturesForUser = jest.fn().mockReturnValue([feature1])
    featureService.getFeaturesForOfflineUser = jest
      .fn()
      .mockReturnValue({ features: [feature1], roles: [RoleName.NAMES.ProUser] })
  })

  it('should fail if a user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ userUuid: 'user-1-1-1', offline: false })).toEqual({
      success: false,
      error: {
        message: 'User user-1-1-1 not found.',
      },
    })
  })

  it('should return user features', async () => {
    expect(await createUseCase().execute({ userUuid: 'user-1-1-1', offline: false })).toEqual({
      success: true,
      userUuid: 'user-1-1-1',
      features: [
        {
          name: 'foobar',
        },
      ],
    })
  })

  it('should return offline user features', async () => {
    expect(await createUseCase().execute({ email: 'test@test.com', offline: true })).toEqual({
      success: true,
      features: [{ name: 'foobar' }],
      offlineRoles: [RoleName.NAMES.ProUser],
    })
  })
})
