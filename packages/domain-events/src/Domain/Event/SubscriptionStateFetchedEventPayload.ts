export interface SubscriptionStateFetchedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: string
  subscriptionExpiresAt: number
  timestamp: number
  offline: boolean
  canceled: boolean
  extensionKey: string
  offlineFeaturesToken: string
}
