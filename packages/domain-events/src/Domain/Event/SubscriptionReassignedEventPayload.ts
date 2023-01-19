export interface SubscriptionReassignedEventPayload {
  userEmail: string
  extensionKey: string
  offline: boolean
  subscriptionId: number
  subscriptionName: string
  subscriptionExpiresAt: number
  timestamp: number
}
