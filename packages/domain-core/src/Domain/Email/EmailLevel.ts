import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'

import { EmailLevelProps } from './EmailLevelProps'

export class EmailLevel extends ValueObject<EmailLevelProps> {
  static readonly LEVELS = {
    System: 'SYSTEM',
    SignIn: 'SIGN_IN',
    Marketing: 'MARKETING',
    FailedCloudBackup: 'FAILED_CLOUD_BACKUP',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: EmailLevelProps) {
    super(props)
  }

  static create(name: string): Result<EmailLevel> {
    const isValidName = Object.values(this.LEVELS).includes(name)
    if (!isValidName) {
      return Result.fail<EmailLevel>(`Invalid subscription rejection level: ${name}`)
    } else {
      return Result.ok<EmailLevel>(new EmailLevel({ value: name }))
    }
  }
}
