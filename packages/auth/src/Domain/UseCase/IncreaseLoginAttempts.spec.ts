import 'reflect-metadata'

import { Logger } from 'winston'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { IncreaseLoginAttempts } from './IncreaseLoginAttempts'

describe('IncreaseLoginAttempts', () => {
  let userRepository: UserRepositoryInterface
  let lockRepository: LockRepositoryInterface
  const maxLoginAttempts = 6
  let user: User
  let logger: Logger

  const createUseCase = () => new IncreaseLoginAttempts(userRepository, lockRepository, maxLoginAttempts, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    user = {} as jest.Mocked<User>
    user.uuid = '123'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.getLockCounter = jest.fn()
    lockRepository.lockUser = jest.fn()
    lockRepository.updateLockCounter = jest.fn()
  })

  it('should do nothing if a user identifier is invalid', async () => {
    expect(await createUseCase().execute({ email: '  ' })).toEqual({ success: false })

    expect(lockRepository.updateLockCounter).not.toHaveBeenCalled()
    expect(lockRepository.lockUser).not.toHaveBeenCalled()
  })

  it('should lock a user if the number of failed login attempts is breached', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValue(5)

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(lockRepository.updateLockCounter).toHaveBeenCalledWith('123', 6)
    expect(lockRepository.lockUser).toHaveBeenCalledWith('123')
  })

  it('should update the lock counter if a user is not exceeding the max failed login attempts', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValue(4)

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(lockRepository.lockUser).not.toHaveBeenCalled()
    expect(lockRepository.updateLockCounter).toHaveBeenCalledWith('123', 5)
  })

  it('should should update the lock counter based on email if user is not found', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValue(4)
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(lockRepository.lockUser).not.toHaveBeenCalled()
    expect(lockRepository.updateLockCounter).toHaveBeenCalledWith('test@test.te', 5)
  })
})
