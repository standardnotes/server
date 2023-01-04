import { CryptoNode } from '@standardnotes/sncrypto-node'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GenerateRecoveryCodes } from './GenerateRecoveryCodes'

describe('GenerateRecoveryCodes', () => {
  let userRepository: UserRepositoryInterface
  let settingService: SettingServiceInterface
  let cryptoNode: CryptoNode

  const createUseCase = () => new GenerateRecoveryCodes(userRepository, settingService, cryptoNode)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue({} as jest.Mocked<User>)

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.createOrReplace = jest.fn()

    cryptoNode = {} as jest.Mocked<CryptoNode>
    cryptoNode.generateRandomKey = jest.fn().mockReturnValue('randomKey123')
  })

  it('should generate recovery codes', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82' })

    expect(settingService.createOrReplace).toHaveBeenCalled()
    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).toEqual('RAND OMKE Y123')
  })

  it('should return error if empty random string', async () => {
    cryptoNode.generateRandomKey = jest.fn().mockReturnValue('')

    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82' })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not generate recovery codes: random key is invalid')
  })

  it('should return error if user not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82' })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not generate recovery codes: user not found')
  })

  it('should return error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: 'invalid' })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not generate recovery codes: Given value is not a valid uuid: invalid')
  })
})
