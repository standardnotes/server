import { RoleName } from './RoleName'

describe('RoleName', () => {
  it('should create a value object', () => {
    const valueOrError = RoleName.create('PRO_USER')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('PRO_USER')
  })

  it('should not create an invalid value object', () => {
    for (const value of ['', undefined, null, 0, 'SOME_USER']) {
      const valueOrError = RoleName.create(value as string)

      expect(valueOrError.isFailed()).toBeTruthy()
    }
  })

  it('should say if a role has more power or equal power to another role', () => {
    const proUserRole = RoleName.create('PRO_USER').getValue()
    const plusUserRole = RoleName.create('PLUS_USER').getValue()
    const coreUser = RoleName.create('CORE_USER').getValue()

    expect(proUserRole.hasMoreOrEqualPowerTo(proUserRole)).toBeTruthy()
    expect(proUserRole.hasMoreOrEqualPowerTo(plusUserRole)).toBeTruthy()
    expect(proUserRole.hasMoreOrEqualPowerTo(coreUser)).toBeTruthy()

    expect(plusUserRole.hasMoreOrEqualPowerTo(proUserRole)).toBeFalsy()
    expect(plusUserRole.hasMoreOrEqualPowerTo(plusUserRole)).toBeTruthy()
    expect(plusUserRole.hasMoreOrEqualPowerTo(coreUser)).toBeTruthy()

    expect(coreUser.hasMoreOrEqualPowerTo(proUserRole)).toBeFalsy()
    expect(coreUser.hasMoreOrEqualPowerTo(plusUserRole)).toBeFalsy()
    expect(coreUser.hasMoreOrEqualPowerTo(coreUser)).toBeTruthy()
  })
})
