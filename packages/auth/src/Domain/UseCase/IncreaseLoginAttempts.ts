import { Username } from '@standardnotes/domain-core'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { IncreaseLoginAttemptsDTO } from './IncreaseLoginAttemptsDTO'
import { IncreaseLoginAttemptsResponse } from './IncreaseLoginAttemptsResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class IncreaseLoginAttempts implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.LockRepository) private lockRepository: LockRepositoryInterface,
    @inject(TYPES.MAX_LOGIN_ATTEMPTS) private maxLoginAttempts: number,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: IncreaseLoginAttemptsDTO): Promise<IncreaseLoginAttemptsResponse> {
    let identifier = dto.email

    const usernameOrError = Username.create(dto.email)
    if (usernameOrError.isFailed()) {
      return { success: false }
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    if (user !== null) {
      identifier = user.uuid
    }

    let numberOfFailedAttempts = await this.lockRepository.getLockCounter(identifier)

    numberOfFailedAttempts += 1

    await this.lockRepository.updateLockCounter(identifier, numberOfFailedAttempts)

    if (numberOfFailedAttempts >= this.maxLoginAttempts) {
      this.logger.debug(`User ${identifier} breached number of allowed login attempts. Locking user.`)

      await this.lockRepository.lockUser(identifier)
    }

    return { success: true }
  }
}
