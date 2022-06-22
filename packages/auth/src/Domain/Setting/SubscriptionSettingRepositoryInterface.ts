import { SubscriptionSetting } from './SubscriptionSetting'

export interface SubscriptionSettingRepositoryInterface {
  findOneByUuid(uuid: string): Promise<SubscriptionSetting | null>
  findLastByNameAndUserSubscriptionUuid(name: string, userSubscriptionUuid: string): Promise<SubscriptionSetting | null>
  save(subscriptionSetting: SubscriptionSetting): Promise<SubscriptionSetting>
}
