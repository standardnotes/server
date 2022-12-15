import { SessionToken } from './SessionToken'

describe('SessionToken', () => {
  it('should create a value object', () => {
    const valueOrError = SessionToken.create('foobar', 1234567890)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('foobar')
    expect(valueOrError.getValue().expiresAt).toEqual(1234567890)
  })

  it('should not create an invalid value object', () => {
    let valueOrError = SessionToken.create('', 1234567890)

    expect(valueOrError.isFailed()).toBeTruthy()

    valueOrError = SessionToken.create('foobar', undefined as unknown as number)

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
