export interface ActivatePremiumFeaturesDTO {
  username: string
  subscriptionId: number
  subscriptionPlanName?: string
  uploadBytesLimit?: number
  endsAt?: Date
  cancelPreviousSubscription?: boolean
}
