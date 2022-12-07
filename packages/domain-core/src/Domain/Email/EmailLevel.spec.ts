import { EmailLevel } from './EmailLevel'

describe('EmailLevel', () => {
  it('should create a value object', () => {
    const valueOrError = EmailLevel.create(EmailLevel.LEVELS.SignIn)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('SIGN_IN')
  })

  it('should not create an invalid value object', () => {
    for (const value of ['', undefined, null, 0, 'FOOBAR']) {
      const valueOrError = EmailLevel.create(value as string)

      expect(valueOrError.isFailed()).toBeTruthy()
    }
  })
})
