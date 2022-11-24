import { RoleName } from './RoleName'
import { RoleNameCollection } from './RoleNameCollection'

describe('RoleNameCollection', () => {
  it('should create a value object', () => {
    const role1 = RoleName.create('PRO_USER').getValue()

    const valueOrError = RoleNameCollection.create([role1])

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual([role1])
  })

  it('should tell if collections are not equal', () => {
    const roles1 = [RoleName.create('PRO_USER').getValue(), RoleName.create('PLUS_USER').getValue()]

    const roles2 = RoleNameCollection.create([
      RoleName.create('PRO_USER').getValue(),
      RoleName.create('CORE_USER').getValue(),
    ]).getValue()

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().equals(roles2)).toBeFalsy()
  })

  it('should tell if collections are equal', () => {
    const roles1 = [RoleName.create('PRO_USER').getValue(), RoleName.create('PLUS_USER').getValue()]

    const roles2 = RoleNameCollection.create([
      RoleName.create('PRO_USER').getValue(),
      RoleName.create('PLUS_USER').getValue(),
    ]).getValue()

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().equals(roles2)).toBeTruthy()
  })

  it('should tell if collection includes element', () => {
    const roles1 = [RoleName.create('PRO_USER').getValue(), RoleName.create('PLUS_USER').getValue()]

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().includes(RoleName.create('PRO_USER').getValue())).toBeTruthy()
  })

  it('should tell if collection does not includes element', () => {
    const roles1 = [RoleName.create('PRO_USER').getValue(), RoleName.create('PLUS_USER').getValue()]

    const valueOrError = RoleNameCollection.create(roles1)
    expect(valueOrError.getValue().includes(RoleName.create('CORE_USER').getValue())).toBeFalsy()
  })
})
