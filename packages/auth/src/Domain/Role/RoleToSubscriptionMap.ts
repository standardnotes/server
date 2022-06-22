import { RoleName, SubscriptionName } from '@standardnotes/common'
import { injectable } from 'inversify'
import { Role } from './Role'

import { RoleToSubscriptionMapInterface } from './RoleToSubscriptionMapInterface'

@injectable()
export class RoleToSubscriptionMap implements RoleToSubscriptionMapInterface {
  private readonly roleNameToSubscriptionNameMap = new Map<RoleName, SubscriptionName>([
    [RoleName.PlusUser, SubscriptionName.PlusPlan],
    [RoleName.ProUser, SubscriptionName.ProPlan],
  ])

  private readonly nonSubscriptionRoles = [RoleName.CoreUser, RoleName.FilesBetaUser]

  filterNonSubscriptionRoles(roles: Role[]): Array<Role> {
    return roles.filter((role) => this.nonSubscriptionRoles.includes(role.name as RoleName))
  }

  getSubscriptionNameForRoleName(roleName: RoleName): SubscriptionName | undefined {
    return this.roleNameToSubscriptionNameMap.get(roleName)
  }

  getRoleNameForSubscriptionName(subscriptionName: SubscriptionName): RoleName | undefined {
    for (const [roleNameItem, subscriptionNameItem] of this.roleNameToSubscriptionNameMap) {
      if (subscriptionNameItem === subscriptionName) {
        return roleNameItem
      }
    }
    return undefined
  }
}
