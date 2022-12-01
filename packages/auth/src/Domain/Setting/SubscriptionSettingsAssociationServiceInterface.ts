import { SubscriptionName } from '@standardnotes/common'

import { SettingDescription } from './SettingDescription'

export interface SubscriptionSettingsAssociationServiceInterface {
  getDefaultSettingsAndValuesForSubscriptionName(
    subscriptionName: SubscriptionName,
  ): Promise<Map<string, SettingDescription> | undefined>
  getFileUploadLimit(subscriptionName: SubscriptionName): Promise<number>
}
