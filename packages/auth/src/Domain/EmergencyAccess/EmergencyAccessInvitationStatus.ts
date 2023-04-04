import { Result, ValueObject } from '@standardnotes/domain-core'

import { EmergencyAccessInvitationStatusProps } from './EmergencyAccessInvitationStatusProps'

export class EmergencyAccessInvitationStatus extends ValueObject<EmergencyAccessInvitationStatusProps> {
  static readonly NAMES = {
    Sent: 'sent',
    Accepted: 'accepted',
    Confirmed: 'confirmed',
    Expired: 'expired',
    Revoked: 'revoked',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: EmergencyAccessInvitationStatusProps) {
    super(props)
  }

  static create(name: string): Result<EmergencyAccessInvitationStatus> {
    const isValidName = Object.values(this.NAMES).includes(name)
    if (!isValidName) {
      return Result.fail<EmergencyAccessInvitationStatus>(`Invalid status name: ${name}`)
    } else {
      return Result.ok<EmergencyAccessInvitationStatus>(new EmergencyAccessInvitationStatus({ value: name }))
    }
  }
}
