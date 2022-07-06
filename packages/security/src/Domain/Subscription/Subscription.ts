import { SubscriptionName } from '@standardnotes/common'

export type Subscription = {
  planName: SubscriptionName
  endsAt: number
  createdAt: number
  updatedAt: number
  cancelled: boolean
}
