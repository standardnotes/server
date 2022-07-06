import { SubscriptionName } from '@standardnotes/common'

export interface ExtensionKeyGrantedEventPayload {
  userEmail: string
  extensionKey: string
  timestamp: number
  offline: boolean
  origin: 'create-user' | 'update-subscription'
  subscriptionName: SubscriptionName | null
  offlineFeaturesToken: string | null
  payAmount: number | null
  billingEveryNMonths: number | null
  activeUntil: string | null
}
