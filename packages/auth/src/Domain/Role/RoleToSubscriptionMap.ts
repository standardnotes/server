import { SubscriptionName } from '@standardnotes/common'
import { RoleName } from '@standardnotes/domain-core'
import { injectable } from 'inversify'
import { Role } from './Role'

import { RoleToSubscriptionMapInterface } from './RoleToSubscriptionMapInterface'

@injectable()
export class RoleToSubscriptionMap implements RoleToSubscriptionMapInterface {
  private readonly roleNameToSubscriptionNameMap = new Map<string, SubscriptionName>([
    [RoleName.NAMES.PlusUser, SubscriptionName.PlusPlan],
    [RoleName.NAMES.ProUser, SubscriptionName.ProPlan],
  ])

  private readonly nonSubscriptionRoles = [RoleName.NAMES.CoreUser, RoleName.NAMES.InternalTeamUser]

  filterNonSubscriptionRoles(roles: Role[]): Array<Role> {
    return roles.filter((role) => this.nonSubscriptionRoles.includes(role.name))
  }

  filterSubscriptionRoles(roles: Role[]): Array<Role> {
    return roles.filter((role) => !this.nonSubscriptionRoles.includes(role.name))
  }

  getSubscriptionNameForRoleName(roleName: string): SubscriptionName | undefined {
    return this.roleNameToSubscriptionNameMap.get(roleName)
  }

  getRoleNameForSubscriptionName(subscriptionName: SubscriptionName): string | undefined {
    for (const [roleNameItem, subscriptionNameItem] of this.roleNameToSubscriptionNameMap) {
      if (subscriptionNameItem === subscriptionName) {
        return roleNameItem
      }
    }
    return undefined
  }
}
