import { SharedVaultUserPermission } from './SharedVaultUserPermission'

describe('SharedVaultUserPermission', () => {
  it('should create a value object', () => {
    const valueOrError = SharedVaultUserPermission.create('read')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('read')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = SharedVaultUserPermission.create('TEST')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
