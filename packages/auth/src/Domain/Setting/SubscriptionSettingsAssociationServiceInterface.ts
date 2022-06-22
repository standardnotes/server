import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionSettingName } from '@standardnotes/settings'

import { SettingDescription } from './SettingDescription'

export interface SubscriptionSettingsAssociationServiceInterface {
  getDefaultSettingsAndValuesForSubscriptionName(
    subscriptionName: SubscriptionName,
  ): Promise<Map<SubscriptionSettingName, SettingDescription> | undefined>
  getFileUploadLimit(subscriptionName: SubscriptionName): Promise<number>
}
