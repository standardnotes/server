import { RoleName } from './RoleName'
import { RoleNameCollection } from './RoleNameCollection'

describe('RoleNameCollection', () => {
  it('should create a value object', () => {
    const role1 = RoleName.create(RoleName.NAMES.ProUser).getValue()

    const valueOrError = RoleNameCollection.create([role1])

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual([role1])
  })

  it('should tell if collections are not equal', () => {
    const roles1 = [
      RoleName.create(RoleName.NAMES.ProUser).getValue(),
      RoleName.create(RoleName.NAMES.PlusUser).getValue(),
    ]

    let roles2 = RoleNameCollection.create([
      RoleName.create(RoleName.NAMES.ProUser).getValue(),
      RoleName.create(RoleName.NAMES.CoreUser).getValue(),
    ]).getValue()

    let valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().equals(roles2)).toBeFalsy()

    roles2 = RoleNameCollection.create([
      RoleName.create(RoleName.NAMES.ProUser).getValue(),
      RoleName.create(RoleName.NAMES.PlusUser).getValue(),
      RoleName.create(RoleName.NAMES.CoreUser).getValue(),
    ]).getValue()

    valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().equals(roles2)).toBeFalsy()
  })

  it('should tell if collections are equal', () => {
    const roles1 = [
      RoleName.create(RoleName.NAMES.ProUser).getValue(),
      RoleName.create(RoleName.NAMES.PlusUser).getValue(),
    ]

    const roles2 = RoleNameCollection.create([
      RoleName.create(RoleName.NAMES.ProUser).getValue(),
      RoleName.create(RoleName.NAMES.PlusUser).getValue(),
    ]).getValue()

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().equals(roles2)).toBeTruthy()
  })

  it('should tell if collection includes element', () => {
    const roles1 = [
      RoleName.create(RoleName.NAMES.ProUser).getValue(),
      RoleName.create(RoleName.NAMES.PlusUser).getValue(),
    ]

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().includes(RoleName.create(RoleName.NAMES.ProUser).getValue())).toBeTruthy()
  })

  it('should tell if collection does not includes element', () => {
    const roles1 = [
      RoleName.create(RoleName.NAMES.ProUser).getValue(),
      RoleName.create(RoleName.NAMES.PlusUser).getValue(),
    ]

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().includes(RoleName.create(RoleName.NAMES.CoreUser).getValue())).toBeFalsy()
  })

  it('should tell if collection has a role with more or equal power to', () => {
    let roles = [RoleName.create(RoleName.NAMES.CoreUser).getValue()]
    let valueOrError = RoleNameCollection.create(roles)
    let roleNames = valueOrError.getValue()

    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.PlusUser).getValue()),
    ).toBeFalsy()
    expect(roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.ProUser).getValue())).toBeFalsy()
    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.CoreUser).getValue()),
    ).toBeTruthy()

    roles = [RoleName.create(RoleName.NAMES.CoreUser).getValue(), RoleName.create(RoleName.NAMES.PlusUser).getValue()]
    valueOrError = RoleNameCollection.create(roles)
    roleNames = valueOrError.getValue()

    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.PlusUser).getValue()),
    ).toBeTruthy()
    expect(roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.ProUser).getValue())).toBeFalsy()
    expect(
      roleNames.hasARoleNameWithMoreOrEqualPowerTo(RoleName.create(RoleName.NAMES.CoreUser).getValue()),
    ).toBeTruthy()

    roles = [RoleName.create(RoleName.NAMES.ProUser).getValue(), RoleName.create(RoleName.NAMES.PlusUser).getValue()]
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
})
