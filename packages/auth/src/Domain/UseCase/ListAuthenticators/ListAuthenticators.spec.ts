import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { ListAuthenticators } from './ListAuthenticators'

describe('ListAuthenticators', () => {
  let authenticatorRepository: AuthenticatorRepositoryInterface

  const createUseCase = () => new ListAuthenticators(authenticatorRepository)

  beforeEach(() => {
    authenticatorRepository = {} as jest.Mocked<AuthenticatorRepositoryInterface>
    authenticatorRepository.findByUserUuid = jest.fn().mockReturnValue([])
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
})
