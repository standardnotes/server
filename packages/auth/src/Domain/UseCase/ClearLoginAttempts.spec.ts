import 'reflect-metadata'
import { Logger } from 'winston'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { ClearLoginAttempts } from './ClearLoginAttempts'

describe('ClearLoginAttempts', () => {
  let userRepository: UserRepositoryInterface
  let lockRepository: LockRepositoryInterface
  let user: User
  let logger: Logger

  const createUseCase = () => new ClearLoginAttempts(userRepository, lockRepository, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    user = {} as jest.Mocked<User>
    user.uuid = '234'

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.resetLockCounter = jest.fn()
  })

  it('should unlock an user by email and uuid', async () => {
    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(lockRepository.resetLockCounter).toHaveBeenCalledTimes(2)
    expect(lockRepository.resetLockCounter).toHaveBeenNthCalledWith(1, 'test@test.te')
    expect(lockRepository.resetLockCounter).toHaveBeenNthCalledWith(2, '234')
  })

  it('should unlock an user by email and uuid if user does not exist', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ email: 'test@test.te' })).toEqual({ success: true })

    expect(lockRepository.resetLockCounter).toHaveBeenCalledTimes(1)
    expect(lockRepository.resetLockCounter).toHaveBeenCalledWith('test@test.te')
  })
})
