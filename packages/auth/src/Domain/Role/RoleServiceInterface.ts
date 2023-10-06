import { PermissionName } from '@standardnotes/features'
import { RoleName, Uuid } from '@standardnotes/domain-core'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { User } from '../User/User'

export interface RoleServiceInterface {
  addRoleToUser(userUuid: Uuid, roleName: RoleName): Promise<void>
  removeRoleFromUser(userUuid: Uuid, roleName: RoleName): Promise<void>
  addUserRoleBasedOnSubscription(user: User, subscriptionName: string): Promise<void>
  setOfflineUserRole(offlineUserSubscription: OfflineUserSubscription): Promise<void>
  removeUserRoleBasedOnSubscription(user: User, subscriptionName: string): Promise<void>
  userHasPermission(userUuid: string, permissionName: PermissionName): Promise<boolean>
}
