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
    it('should succeed with correct server password and version 2', async () => {
      mockBcryptCompare.mockResolvedValue(true)

      const result = await createUseCase().execute({
        user,
        serverPassword: 'correct-password',
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).toHaveBeenCalledWith('correct-password', 'hashed-password')
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should succeed without checking password if version is less than 2', async () => {
      const result = await createUseCase().execute({
        user,
        serverPassword: 'any-password',
        authTokenVersion: 1,
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should succeed with correct password if version is 3', async () => {
      mockBcryptCompare.mockResolvedValue(true)

      const result = await createUseCase().execute({
        user,
        serverPassword: 'correct-password',
        authTokenVersion: 3,
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).toHaveBeenCalledWith('correct-password', 'hashed-password')
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should succeed without checking password if version is undefined', async () => {
      const result = await createUseCase().execute({
        user,
        serverPassword: 'any-password',
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should fail with incorrect server password and version 2', async () => {
      mockBcryptCompare.mockResolvedValue(false)

      const result = await createUseCase().execute({
        user,
        serverPassword: 'wrong-password',
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('The password you entered is incorrect. Please try again.')
      expect(mockBcryptCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password')
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should fail when server password is not provided and version is 2', async () => {
      const result = await createUseCase().execute({
        user,
        serverPassword: undefined,
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Please update your application to the latest version.')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should fail when server password is empty string and version is 2', async () => {
      const result = await createUseCase().execute({
        user,
        serverPassword: '',
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Please update your application to the latest version.')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })
  })

  describe('with userUuid provided', () => {
    it('should succeed with correct server password and valid userUuid and version 2', async () => {
      mockBcryptCompare.mockResolvedValue(true)

      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'correct-password',
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).toHaveBeenCalledWith('correct-password', 'hashed-password')
      expect(userRepository.findOneByUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
    })

    it('should succeed without checking password if version is less than 2', async () => {
      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'any-password',
        authTokenVersion: 1,
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should succeed with correct password and valid userUuid and version 3', async () => {
      mockBcryptCompare.mockResolvedValue(true)

      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'correct-password',
        authTokenVersion: 3,
      })

      expect(result.isFailed()).toBeFalsy()
      expect(mockBcryptCompare).toHaveBeenCalledWith('correct-password', 'hashed-password')
      expect(userRepository.findOneByUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
    })

    it('should fail with incorrect server password and valid userUuid and version 2', async () => {
      mockBcryptCompare.mockResolvedValue(false)

      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'wrong-password',
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('The password you entered is incorrect. Please try again.')
      expect(mockBcryptCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password')
      expect(userRepository.findOneByUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
    })

    it('should fail with invalid userUuid and version 2', async () => {
      const result = await createUseCase().execute({
        userUuid: 'invalid-uuid',
        serverPassword: 'some-password',
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toContain('invalid-uuid')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })

    it('should fail when user is not found and version is 2', async () => {
      userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'some-password',
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('User not found.')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).toHaveBeenCalledWith(
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )
    })

    it('should fail when server password is not provided with userUuid and version is 2', async () => {
      const result = await createUseCase().execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: undefined,
        authTokenVersion: 2,
      })

      expect(result.isFailed()).toBeTruthy()
      expect(result.getError()).toEqual('Please update your application to the latest version.')
      expect(mockBcryptCompare).not.toHaveBeenCalled()
      expect(userRepository.findOneByUuid).not.toHaveBeenCalled()
    })
  })
})
