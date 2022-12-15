import { LegacySession } from './LegacySession'

describe('LegacySession', () => {
  it('should create a value object', () => {
    const valueOrError = LegacySession.create('foobar')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().accessToken).toEqual('foobar')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = LegacySession.create('')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
