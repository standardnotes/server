import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'

import { EmailSubscriptionRejectionLevelProps } from './EmailSubscriptionRejectionLevelProps'

export class EmailSubscriptionRejectionLevel extends ValueObject<EmailSubscriptionRejectionLevelProps> {
  static readonly LEVELS = {
    SignIn: 'SIGN_IN',
    Marketing: 'MARKETING',
    FailedCloudBackup: 'FAILED_CLOUD_BACKUP',
    FailedEmailBackup: 'FAILED_EMAIL_BACKUP',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: EmailSubscriptionRejectionLevelProps) {
    super(props)
  }

  static create(name: string): Result<EmailSubscriptionRejectionLevel> {
    const isValidName = Object.values(this.LEVELS).includes(name)
    if (!isValidName) {
      return Result.fail<EmailSubscriptionRejectionLevel>(`Invalid subscription rejection level: ${name}`)
    } else {
      return Result.ok<EmailSubscriptionRejectionLevel>(new EmailSubscriptionRejectionLevel({ value: name }))
    }
  }
}
