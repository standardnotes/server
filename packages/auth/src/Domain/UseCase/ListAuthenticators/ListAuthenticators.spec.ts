import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { FeatureServiceInterface } from '../../Feature/FeatureServiceInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { ListAuthenticators } from './ListAuthenticators'

describe('ListAuthenticators', () => {
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let userRepository: UserRepositoryInterface
  let featureService: FeatureServiceInterface

  const createUseCase = () => new ListAuthenticators(authenticatorRepository, userRepository, featureService)

  beforeEach(() => {
    authenticatorRepository = {} as jest.Mocked<AuthenticatorRepositoryInterface>
    authenticatorRepository.findByUserUuid = jest.fn().mockReturnValue([])

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue({} as jest.Mocked<User>)

    featureService = {} as jest.Mocked<FeatureServiceInterface>
    featureService.userIsEntitledToFeature = jest.fn().mockReturnValue(true)
  })

  it('should list authenticators', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '00000000-0000-0000-0000-000000000000' })

    expect(result.isFailed()).toBeFalsy()
    expect(authenticatorRepository.findByUserUuid).toHaveBeenCalled()
  })

  it('should fail if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: 'invalid' })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '00000000-0000-0000-0000-000000000000' })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if user is not entitled to U2F', async () => {
    featureService.userIsEntitledToFeature = jest.fn().mockReturnValue(false)

    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '00000000-0000-0000-0000-000000000000' })

    expect(result.isFailed()).toBeTruthy()
  })
})
