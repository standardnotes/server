import { ServiceIdentifier } from './ServiceIdentifier'

describe('ServiceIdentifier', () => {
  it('should create a value object', () => {
    const valueOrError = ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('Auth')
  })

  it('should not create an invalid value object', () => {
    for (const value of ['', undefined, null, 0, 'SOME_SERVICE']) {
      const valueOrError = ServiceIdentifier.create(value as string)

      expect(valueOrError.isFailed()).toBeTruthy()
    }
  })
})
