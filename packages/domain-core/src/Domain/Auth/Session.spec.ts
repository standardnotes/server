import { Session } from './Session'
import { SessionToken } from './SessionToken'

describe('Session', () => {
  it('should create a session value object', () => {
    const accessToken = SessionToken.create('foobar1', 1234567890).getValue()
    const refreshToken = SessionToken.create('foobar2', 1234567890).getValue()

    const valueOrError = Session.create(accessToken, refreshToken)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().accessToken.value).toEqual('foobar1')
    expect(valueOrError.getValue().refreshToken.value).toEqual('foobar2')
    expect(valueOrError.getValue().isReadOnly()).toEqual(false)
  })

  it('should create a session reado-only value object', () => {
    const accessToken = SessionToken.create('foobar', 1234567890).getValue()
    const refreshToken = SessionToken.create('foobar', 1234567890).getValue()

    const valueOrError = Session.create(accessToken, refreshToken, true)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().isReadOnly()).toEqual(true)
  })
})
