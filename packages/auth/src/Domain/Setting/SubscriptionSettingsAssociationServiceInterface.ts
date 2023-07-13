import { SubscriptionName } from '@standardnotes/common'

import { SettingDescription } from './SettingDescription'

export interface SubscriptionSettingsAssociationServiceInterface {
  getDefaultSettingsAndValuesForSubscriptionName(
    subscriptionName: string,
  ): Promise<Map<string, SettingDescription> | undefined>
  getFileUploadLimit(subscriptionName: SubscriptionName): Promise<number>
}
