import { Dates, Uuid } from '@standardnotes/domain-core'

import { EmergencyAccessInvitationStatus } from './EmergencyAccessInvitationStatus'

export interface EmergencyAccessInvitationProps {
  grantorUuid: Uuid
  granteeUuid: Uuid
  status: EmergencyAccessInvitationStatus
  expiresAt: Date
  dates: Dates
}
