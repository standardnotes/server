import { Result, UseCaseInterface, Username } from '@standardnotes/domain-core'

import { LockRepositoryInterface } from '../User/LockRepositoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { IncreaseLoginAttemptsDTO } from './IncreaseLoginAttemptsDTO'
import { IncreaseLoginAttemptsResponse } from './IncreaseLoginAttemptsResponse'

export class IncreaseLoginAttempts implements UseCaseInterface<IncreaseLoginAttemptsResponse> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private lockRepository: LockRepositoryInterface,
    private maxNonCaptchaAttempts: number,
  ) {}

  async execute(dto: IncreaseLoginAttemptsDTO): Promise<Result<IncreaseLoginAttemptsResponse>> {
    let identifier = dto.email

    const usernameOrError = Username.create(dto.email)
    if (usernameOrError.isFailed()) {
      return Result.fail(usernameOrError.getError())
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    if (user !== null) {
      identifier = user.uuid
    }

    const numberOfFailedAttempts = await this.lockRepository.getLockCounter(identifier, 'non-captcha')
    const numberOfFailedAttemptsInCaptchaMode = await this.lockRepository.getLockCounter(identifier, 'captcha')

    const isEligibleForNonCaptchaMode =
      numberOfFailedAttemptsInCaptchaMode === 0 && numberOfFailedAttempts < this.maxNonCaptchaAttempts
    const isNonCaptchaLimitReached =
      numberOfFailedAttempts + 1 >= this.maxNonCaptchaAttempts || numberOfFailedAttemptsInCaptchaMode > 0

    let newCounter: number
    if (isEligibleForNonCaptchaMode) {
      newCounter = numberOfFailedAttempts + 1
    } else {
      newCounter = numberOfFailedAttemptsInCaptchaMode + 1
    }

    await this.lockRepository.updateLockCounter(
      identifier,
      newCounter,
      isEligibleForNonCaptchaMode ? 'non-captcha' : 'captcha',
    )

    return Result.ok({
      isNonCaptchaLimitReached,
    })
  }
}
