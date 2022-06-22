import { SubscriptionSetting } from './SubscriptionSetting'

export type SimpleSubscriptionSetting = Omit<SubscriptionSetting, 'userSubscription' | 'serverEncryptionVersion'>
