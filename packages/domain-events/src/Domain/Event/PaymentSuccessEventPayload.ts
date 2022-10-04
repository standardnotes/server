export interface PaymentSuccessEventPayload {
  userEmail: string
  amount: number
  billingFrequency: number
  paymentType: string
  subscriptionName: string
}
