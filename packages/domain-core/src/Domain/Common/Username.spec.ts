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
})
