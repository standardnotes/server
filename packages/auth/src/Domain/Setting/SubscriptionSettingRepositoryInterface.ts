import { SubscriptionSetting } from './SubscriptionSetting'

export interface SubscriptionSettingRepositoryInterface {
  findOneByUuid(uuid: string): Promise<SubscriptionSetting | null>
  findLastByNameAndUserSubscriptionUuid(name: string, userSubscriptionUuid: string): Promise<SubscriptionSetting | null>
  findAllBySubscriptionUuid(userSubscriptionUuid: string): Promise<SubscriptionSetting[]>
  save(subscriptionSetting: SubscriptionSetting): Promise<SubscriptionSetting>
}
