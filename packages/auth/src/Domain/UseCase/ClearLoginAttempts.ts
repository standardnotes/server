import { Result, UseCaseInterface, Username } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { LockRepositoryInterface } from '../User/LockRepositoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { ClearLoginAttemptsDTO } from './ClearLoginAttemptsDTO'

export class ClearLoginAttempts implements UseCaseInterface<void> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private lockRepository: LockRepositoryInterface,
    private logger: Logger,
  ) {}

  async execute(dto: ClearLoginAttemptsDTO): Promise<Result<void>> {
    const usernameOrError = Username.create(dto.email)
    if (usernameOrError.isFailed()) {
      return Result.fail(usernameOrError.getError())
    }
    const username = usernameOrError.getValue()

    await this.lockRepository.resetLockCounter(dto.email)

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

    if (!user) {
      return Result.ok()
    }

    this.logger.debug('Resetting lock counter for user', {
      userId: user.uuid,
    })

    await this.lockRepository.resetLockCounter(user.uuid)

    return Result.ok()
  }
}
