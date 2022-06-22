import { SubscriptionName } from '@standardnotes/common'
import { PermissionName } from '@standardnotes/features'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { User } from '../User/User'

export interface RoleServiceInterface {
  addUserRole(user: User, subscriptionName: SubscriptionName): Promise<void>
  setOfflineUserRole(offlineUserSubscription: OfflineUserSubscription): Promise<void>
  removeUserRole(user: User, subscriptionName: SubscriptionName): Promise<void>
  userHasPermission(userUuid: string, permissionName: PermissionName): Promise<boolean>
}
