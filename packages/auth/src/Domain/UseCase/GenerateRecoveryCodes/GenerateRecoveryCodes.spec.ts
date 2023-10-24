import { CryptoNode } from '@standardnotes/sncrypto-node'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GenerateRecoveryCodes } from './GenerateRecoveryCodes'
import { SetSettingValue } from '../SetSettingValue/SetSettingValue'
import { Result } from '@standardnotes/domain-core'

describe('GenerateRecoveryCodes', () => {
  let userRepository: UserRepositoryInterface
  let setSettingValue: SetSettingValue
  let cryptoNode: CryptoNode

  const createUseCase = () => new GenerateRecoveryCodes(userRepository, setSettingValue, cryptoNode)

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue({} as jest.Mocked<User>)

    setSettingValue = {} as jest.Mocked<SetSettingValue>
    setSettingValue.execute = jest.fn().mockReturnValue(Result.ok())

    cryptoNode = {} as jest.Mocked<CryptoNode>
    cryptoNode.generateRandomKey = jest.fn().mockReturnValue('randomKey123')
  })

  it('should generate recovery codes', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82' })

    expect(setSettingValue.execute).toHaveBeenCalled()
    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).toEqual('RAND OMKE Y123')
  })

  it('should return error if could not persist recovery codes setting', async () => {
    setSettingValue.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82' })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not generate recovery codes: error')
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
