import 'reflect-metadata'

import { LockRepositoryInterface } from '../User/LockRepositoryInterface'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { IncreaseLoginAttempts } from './IncreaseLoginAttempts'

describe('IncreaseLoginAttempts', () => {
  let userRepository: UserRepositoryInterface
  let lockRepository: LockRepositoryInterface
  const maxLoginAttempts = 6
  let user: User

  const createUseCase = () => new IncreaseLoginAttempts(userRepository, lockRepository, maxLoginAttempts)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.getLockCounter = jest.fn()
    lockRepository.updateLockCounter = jest.fn()
  })

  it('should do nothing if a user identifier is invalid', async () => {
    const result = await createUseCase().execute({ email: '  ' })
    expect(result.isFailed()).toEqual(true)

    expect(lockRepository.updateLockCounter).not.toHaveBeenCalled()
  })

  it('should update the lock counter if a user is not exceeding the max failed login attempts', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(4).mockReturnValueOnce(0)

    const result = await createUseCase().execute({ email: 'test@test.te' })
    expect(result.isFailed()).toEqual(false)

    expect(lockRepository.updateLockCounter).toHaveBeenCalledWith('123', 5, 'non-captcha')
  })

  it('should update the captcha lock counter if a user is exceeding the max failed login attempts', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(6).mockReturnValueOnce(0)

    const result = await createUseCase().execute({ email: 'test@test.te' })
    expect(result.isFailed()).toEqual(false)

    expect(lockRepository.updateLockCounter).toHaveBeenCalledWith('123', 1, 'captcha')
  })

  it('should should update the lock counter based on email if user is not found', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(4).mockReturnValueOnce(0)
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({ email: 'test@test.te' })
    expect(result.isFailed()).toEqual(false)

    expect(lockRepository.updateLockCounter).toHaveBeenCalledWith('test@test.te', 5, 'non-captcha')
  })
})
