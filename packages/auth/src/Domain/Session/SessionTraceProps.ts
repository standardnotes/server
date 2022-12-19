import { SubscriptionPlanName, Username, Uuid } from '@standardnotes/domain-core'

export interface SessionTraceProps {
  userUuid: Uuid
  username: Username
  createdAt: Date
  expiresAt: Date
  subscriptionPlanName: SubscriptionPlanName | null
}
