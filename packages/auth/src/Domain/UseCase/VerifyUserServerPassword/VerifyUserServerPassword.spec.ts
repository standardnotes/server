import 'reflect-metadata'

import { Uuid } from '@standardnotes/domain-core'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { VerifyUserServerPassword } from './VerifyUserServerPassword'

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
const mockBcryptCompare = require('bcryptjs').compare as jest.MockedFunction<any>

describe('VerifyUserServerPassword', () => {
  let userRepository: UserRepositoryInterface
  let user: User

  const createUseCase = () => new VerifyUserServerPassword(userRepository)

  beforeEach(() => {
    user = {
      uuid: '00000000-0000-0000-0000-000000000000',
      email: 'test@test.te',
      encryptedPassword: 'hashed-password',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    // Reset bcrypt mocks
    mockBcryptCompare.mockReset()
  })

  describe('with user object provided', () => {
    it('should succeed with correct server password', async () => {
      mockBcryptCompare.mockResolvedValue(true)

      const result = await createUseCase().execute({
        user,
        serverPassword: 'correct-password',
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).toHaveBeenCalledWith('correct-password', 'hashed-password')
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should fail when server password is not provided', async () => {
      const result = await createUseCase().execute({
        user,
        serverPassword: undefined,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Please update your application to the latest version.')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should fail with incorrect server password', async () => {
      mockBcryptCompare.mockResolvedValue(false)

      const result = await createUseCase().execute({
        user,
        serverPassword: 'wrong-password',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('The password you entered is incorrect. Please try again.')
      expect(mockBcryptCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password')
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should fail when server password is empty string', async () => {
      const result = await createUseCase().execute({
        user,
        serverPassword: '',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Please update your application to the latest version.')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })
  })

  describe('with userUuid provided', () => {
    it('should succeed with correct server password and valid userUuid', async () => {
      mockBcryptCompare.mockResolvedValue(true)

      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'correct-password',
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).toHaveBeenCalledWith('correct-password', 'hashed-password')
      expect(userRepository.findOneByUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
    })

    it('should fail with incorrect server password and valid userUuid', async () => {
      mockBcryptCompare.mockResolvedValue(false)

      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'wrong-password',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('The password you entered is incorrect. Please try again.')
      expect(mockBcryptCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password')
      expect(userRepository.findOneByUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
    })

    it('should fail with invalid userUuid', async () => {
      const result = await createUseCase().execute({
        userUuid: 'invalid-uuid',
        serverPassword: 'some-password',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toContain('invalid-uuid')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should fail when user is not found', async () => {
      userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'some-password',
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('User not found.')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
    })

    it('should fail when server password is not provided with userUuid', async () => {
      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: undefined,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Please update your application to the latest version.')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })
  })
})
