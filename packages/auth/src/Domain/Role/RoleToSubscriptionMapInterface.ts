import { RoleName, SubscriptionName } from '@standardnotes/common'
import { Role } from './Role'

export interface RoleToSubscriptionMapInterface {
  filterNonSubscriptionRoles(roles: Role[]): Array<Role>
  filterSubscriptionRoles(roles: Role[]): Array<Role>
  getSubscriptionNameForRoleName(roleName: RoleName): SubscriptionName | undefined
  getRoleNameForSubscriptionName(subscriptionName: SubscriptionName): RoleName | undefined
}
