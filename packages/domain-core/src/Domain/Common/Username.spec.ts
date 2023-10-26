import { Username } from './Username'

describe('Username', () => {
  it('should create a value object', () => {
    const valueOrError = Username.create('test@test.te')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('test@test.te')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Username.create('')

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should not create an invalid type object', () => {
    const valueOrError = Username.create(undefined as unknown as string)

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should indicate if the username is potentially a vault account', () => {
    const value = Username.create('a75a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67').getValue()

    expect(value.isPotentiallyAPrivateUsernameAccount()).toBeTruthy()
  })

  it('should indicate if the user is not a vault account', () => {
    const value = Username.create('test@test.te').getValue()

    expect(value.isPotentiallyAPrivateUsernameAccount()).toBeFalsy()
  })
})
