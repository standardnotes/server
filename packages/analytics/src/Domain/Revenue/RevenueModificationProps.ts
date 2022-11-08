import { MonthlyRevenue } from './MonthlyRevenue'
import { Subscription } from '../Subscription/Subscription'
import { User } from '../User/User'
import { SubscriptionEventType } from '../Subscription/SubscriptionEventType'

export interface RevenueModificationProps {
  user: User
  subscription: Subscription
  eventType: SubscriptionEventType
  previousMonthlyRevenue: MonthlyRevenue
  createdAt?: Date
}
