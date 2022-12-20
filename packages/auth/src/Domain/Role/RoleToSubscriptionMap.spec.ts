import 'reflect-metadata'

import { RoleName, SubscriptionName } from '@standardnotes/common'

import { RoleToSubscriptionMap } from './RoleToSubscriptionMap'
import { Role } from './Role'

describe('RoleToSubscriptionMap', () => {
  const createMap = () => new RoleToSubscriptionMap()

  it('should return subscription name for role name', () => {
    expect(createMap().getSubscriptionNameForRoleName(RoleName.ProUser)).toEqual(SubscriptionName.ProPlan)
  })

  it('should return role name for subscription name', () => {
    expect(createMap().getRoleNameForSubscriptionName(SubscriptionName.PlusPlan)).toEqual(RoleName.PlusUser)
  })

  it('should not return role name for subscription name that does not exist', () => {
    expect(createMap().getRoleNameForSubscriptionName('test' as SubscriptionName)).toEqual(undefined)
  })

  it('should filter our non subscription roles from an array of roles', () => {
    const roles = [
      {
        name: RoleName.CoreUser,
      } as jest.Mocked<Role>,
      {
        name: RoleName.FilesBetaUser,
      } as jest.Mocked<Role>,
      {
        name: RoleName.PlusUser,
      } as jest.Mocked<Role>,
    ]
    expect(createMap().filterNonSubscriptionRoles(roles)).toEqual([
      {
        name: RoleName.CoreUser,
      },
      {
        name: RoleName.FilesBetaUser,
      },
    ])
  })

  it('should filter our subscription roles from an array of roles', () => {
    const roles = [
      {
        name: RoleName.CoreUser,
      } as jest.Mocked<Role>,
      {
        name: RoleName.FilesBetaUser,
      } as jest.Mocked<Role>,
      {
        name: RoleName.PlusUser,
      } as jest.Mocked<Role>,
    ]
    expect(createMap().filterSubscriptionRoles(roles)).toEqual([
      {
        name: RoleName.PlusUser,
      },
    ])
  })
})
