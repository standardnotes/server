import { Result, UseCaseInterface } from '@standardnotes/domain-core'
import { CaptchaServerInterface } from '../../HumanVerification/CaptchaServerInterface'

export class VerifyHumanInteraction implements UseCaseInterface<void> {
  constructor(
    private isEnabled: boolean,
    private captchaServer: CaptchaServerInterface,
  ) {}

  async execute(hvmToken?: string): Promise<Result<void>> {
    if (!this.isEnabled) {
      return Result.ok()
    }

    if (!hvmToken) {
      return Result.fail('No HVM token available.')
    }

    const isSuccess = await this.captchaServer.verify(hvmToken)

    return isSuccess ? Result.ok() : Result.fail('Human verification step failed.')
  }
}
