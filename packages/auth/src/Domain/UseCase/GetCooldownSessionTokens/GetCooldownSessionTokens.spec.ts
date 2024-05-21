import { SessionTokensCooldownRepositoryInterface } from '../../Session/SessionTokensCooldownRepositoryInterface'
import { GetCooldownSessionTokens } from './GetCooldownSessionTokens'

describe('GetCooldownSessionTokens', () => {
  let sessionTokensCooldownRepository: SessionTokensCooldownRepositoryInterface

  const createUseCase = () => new GetCooldownSessionTokens(sessionTokensCooldownRepository)

  beforeEach(() => {
    sessionTokensCooldownRepository = {} as jest.Mocked<SessionTokensCooldownRepositoryInterface>
    sessionTokensCooldownRepository.getHashedTokens = jest.fn().mockReturnValue(null)
  })

  it('should return an error if the sessionUuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ sessionUuid: 'invalidUuid' })

    expect(result.isFailed()).toBe(true)
  })

  it('should return an error if no tokens are found', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ sessionUuid: '00000000-0000-0000-0000-000000000000' })

    expect(result.isFailed()).toBe(true)
  })

  it('should return the hashed tokens', async () => {
    sessionTokensCooldownRepository.getHashedTokens = jest.fn().mockReturnValue({
      hashedAccessToken: 'hashedAccessToken',
      hashedRefreshToken: 'hashedRefreshToken',
    })

    const useCase = createUseCase()

    const result = await useCase.execute({ sessionUuid: '00000000-0000-0000-0000-000000000000' })

    expect(result.isFailed()).toBeFalsy()

    const value = result.getValue()

    expect(value.hashedAccessToken).toBe('hashedAccessToken')
    expect(value.hashedRefreshToken).toBe('hashedRefreshToken')
  })
})
