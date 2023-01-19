import { SubscriptionName } from '@standardnotes/common'
import { Role } from './Role'

export interface RoleToSubscriptionMapInterface {
  filterNonSubscriptionRoles(roles: Role[]): Array<Role>
  filterSubscriptionRoles(roles: Role[]): Array<Role>
  getSubscriptionNameForRoleName(roleName: string): SubscriptionName | undefined
  getRoleNameForSubscriptionName(subscriptionName: SubscriptionName): string | undefined
}
