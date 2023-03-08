import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { RoleName } from '@standardnotes/domain-core'

import { RoleToSubscriptionMap } from './RoleToSubscriptionMap'
import { Role } from './Role'

describe('RoleToSubscriptionMap', () => {
  const createMap = () => new RoleToSubscriptionMap()

  it('should return subscription name for role name', () => {
    expect(createMap().getSubscriptionNameForRoleName(RoleName.NAMES.ProUser)).toEqual(SubscriptionName.ProPlan)
  })

  it('should return role name for subscription name', () => {
    expect(createMap().getRoleNameForSubscriptionName(SubscriptionName.PlusPlan)).toEqual(RoleName.NAMES.PlusUser)
  })

  it('should not return role name for subscription name that does not exist', () => {
    expect(createMap().getRoleNameForSubscriptionName('test' as SubscriptionName)).toEqual(undefined)
  })

  it('should filter our non subscription roles from an array of roles', () => {
    const roles = [
      {
        name: RoleName.NAMES.CoreUser,
      } as jest.Mocked<Role>,
      {
        name: RoleName.NAMES.InternalTeamUser,
      } as jest.Mocked<Role>,
      {
        name: RoleName.NAMES.PlusUser,
      } as jest.Mocked<Role>,
    ]
    expect(createMap().filterNonSubscriptionRoles(roles)).toEqual([
      {
        name: RoleName.NAMES.CoreUser,
      },
      {
        name: RoleName.NAMES.InternalTeamUser,
      },
    ])
  })

  it('should filter our subscription roles from an array of roles', () => {
    const roles = [
      {
        name: RoleName.NAMES.CoreUser,
      } as jest.Mocked<Role>,
      {
        name: RoleName.NAMES.InternalTeamUser,
      } as jest.Mocked<Role>,
      {
        name: RoleName.NAMES.PlusUser,
      } as jest.Mocked<Role>,
    ]
    expect(createMap().filterSubscriptionRoles(roles)).toEqual([
      {
        name: RoleName.NAMES.PlusUser,
      },
    ])
  })
})
