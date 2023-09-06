import { RoleName } from './RoleName'
import { RoleNameCollection } from './RoleNameCollection'

describe('RoleNameCollection', () => {
  it('should create a value object', () => {
    const valueOrError = RoleNameCollection.create([RoleName.NAMES.ProUser])

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value[0].value).toEqual('PRO_USER')
  })

  it('should tell if collections are not equal', () => {
    const roles1 = [RoleName.NAMES.ProUser, RoleName.NAMES.PlusUser]

    let roles2 = RoleNameCollection.create([RoleName.NAMES.ProUser, RoleName.NAMES.CoreUser]).getValue()

    let valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().equals(roles2)).toBeFalsy()

    roles2 = RoleNameCollection.create([
      RoleName.NAMES.ProUser,
      RoleName.NAMES.PlusUser,
      RoleName.NAMES.CoreUser,
    ]).getValue()

    valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().equals(roles2)).toBeFalsy()
  })

  it('should tell if collections are equal', () => {
    const roles1 = [RoleName.NAMES.ProUser, RoleName.NAMES.PlusUser]

    const roles2 = RoleNameCollection.create([RoleName.NAMES.ProUser, RoleName.NAMES.PlusUser]).getValue()

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().equals(roles2)).toBeTruthy()
  })

  it('should tell if collection includes element', () => {
    const roles1 = [RoleName.NAMES.ProUser, RoleName.NAMES.PlusUser]

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().includes(RoleName.create(RoleName.NAMES.ProUser).getValue())).toBeTruthy()
  })

  it('should tell if collection does not includes element', () => {
    const roles1 = [RoleName.NAMES.ProUser, RoleName.NAMES.PlusUser]

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().includes(RoleName.create(RoleName.NAMES.CoreUser).getValue())).toBeFalsy()
  })

  it('should tell if collection has a role with more or equal power to', () => {
    let roles = [RoleName.NAMES.VaultsUser]
    let valueOrError = RoleNameCollection.create(roles)
    let roleNames = valueOrError.getValue()

    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.PlusUser).getValue()),
    ).toBeFalsy()
    expect(roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.ProUser).getValue())).toBeFalsy()
    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.CoreUser).getValue()),
    ).toBeTruthy()

    roles = [RoleName.NAMES.CoreUser]
    valueOrError = RoleNameCollection.create(roles)
    roleNames = valueOrError.getValue()

    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.PlusUser).getValue()),
    ).toBeFalsy()
    expect(roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.ProUser).getValue())).toBeFalsy()
    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.CoreUser).getValue()),
    ).toBeTruthy()

    roles = [RoleName.NAMES.CoreUser, RoleName.NAMES.PlusUser]
    valueOrError = RoleNameCollection.create(roles)
    roleNames = valueOrError.getValue()

    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.PlusUser).getValue()),
    ).toBeTruthy()
    expect(roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.ProUser).getValue())).toBeFalsy()
    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.CoreUser).getValue()),
    ).toBeTruthy()

    roles = [RoleName.NAMES.ProUser, RoleName.NAMES.PlusUser]
    valueOrError = RoleNameCollection.create(roles)
    roleNames = valueOrError.getValue()

    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.PlusUser).getValue()),
    ).toBeTruthy()
    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.ProUser).getValue()),
    ).toBeTruthy()
    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.CoreUser).getValue()),
    ).toBeTruthy()
  })

  it('should fail to create a collection if a role name is invalid', () => {
    const valueOrError = RoleNameCollection.create(['invalid-role-name'])

    expect(valueOrError.isFailed()).toBeTruthy()
    expect(valueOrError.getError()).toEqual('Invalid role name: invalid-role-name')
  })
})
