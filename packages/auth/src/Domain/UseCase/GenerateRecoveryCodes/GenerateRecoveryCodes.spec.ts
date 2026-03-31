import { CryptoNode } from '@standardnotes/sncrypto-node'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GenerateRecoveryCodes } from './GenerateRecoveryCodes'
import { SetSettingValue } from '../SetSettingValue/SetSettingValue'
import { VerifyUserServerPassword } from '../VerifyUserServerPassword/VerifyUserServerPassword'
import { Result } from '@standardnotes/domain-core'

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
const mockBcryptCompare = require('bcryptjs').compare as jest.MockedFunction<any>

describe('GenerateRecoveryCodes', () => {
  let userRepository: UserRepositoryInterface
  let setSettingValue: SetSettingValue
  let cryptoNode: CryptoNode
  let verifyUserServerPassword: VerifyUserServerPassword
  let user: User

  const createUseCase = () =>
    new GenerateRecoveryCodes(userRepository, setSettingValue, cryptoNode, verifyUserServerPassword)

  beforeEach(() => {
    user = {
      uuid: '1-2-3',
      email: 'test@test.te',
      encryptedPassword: 'hashed-password',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    setSettingValue = {} as jest.Mocked<SetSettingValue>
    setSettingValue.execute = jest.fn().mockReturnValue(Result.ok())

    cryptoNode = {} as jest.Mocked<CryptoNode>
    cryptoNode.generateRandomKey = jest.fn().mockReturnValue('randomKey123')

    verifyUserServerPassword = {} as jest.Mocked<VerifyUserServerPassword>
    verifyUserServerPassword.execute = jest.fn()

    // Reset bcrypt mocks
    mockBcryptCompare.mockReset()
  })

  it('should generate recovery codes when server password is correct', async () => {
    verifyUserServerPassword.execute = jest.fn().mockReturnValue(Result.ok())
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82',
      serverPassword: 'correct-password',
      shouldVerifyUserServerPassword: true,
    })

    expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
      user,
      serverPassword: 'correct-password',
      authTokenVersion: undefined,
    })
    expect(setSettingValue.execute).toHaveBeenCalled()
    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()).toEqual('RAND OMKE Y123')
  })

  it('should generate recovery codes without password verification when shouldVerifyUserServerPassword is false', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82',
      shouldVerifyUserServerPassword: false,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(verifyUserServerPassword.execute).not.toHaveBeenCalled()
    expect(setSettingValue.execute).toHaveBeenCalled()
    expect(result.getValue()).toEqual('RAND OMKE Y123')
  })

  it('should fail when password is incorrect', async () => {
    verifyUserServerPassword.execute = jest
      .fn()
      .mockReturnValue(Result.fail('The password you entered is incorrect. Please try again.'))
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82',
      serverPassword: 'wrong-password',
      shouldVerifyUserServerPassword: true,
    })

    expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
      user,
      serverPassword: 'wrong-password',
      authTokenVersion: undefined,
    })
    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('The password you entered is incorrect. Please try again.')
    expect(setSettingValue.execute).not.toHaveBeenCalled()
  })

  it('should return error if could not persist recovery codes setting', async () => {
    mockBcryptCompare.mockResolvedValue(true)
    setSettingValue.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82',
      serverPassword: 'correct-password',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not generate recovery codes: error')
  })

  it('should return error if empty random string', async () => {
    mockBcryptCompare.mockResolvedValue(true)
    cryptoNode.generateRandomKey = jest.fn().mockReturnValue('')

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82',
      serverPassword: 'correct-password',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not generate recovery codes: random key is invalid')
  })

  it('should return error if user not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '2221101c-1da9-4d2b-9b32-b8be2a8d1c82',
      serverPassword: 'correct-password',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not generate recovery codes: user not found')
  })

  it('should return error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      serverPassword: 'correct-password',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not generate recovery codes: Given value is not a valid uuid: invalid')
  })
})
