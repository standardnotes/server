import { EmailSubscriptionRejectionLevel } from './EmailSubscriptionRejectionLevel'

describe('EmailSubscriptionRejectionLevel', () => {
  it('should create a value object', () => {
    const valueOrError = EmailSubscriptionRejectionLevel.create(EmailSubscriptionRejectionLevel.LEVELS.SignIn)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('SIGN_IN')
  })

  it('should not create an invalid value object', () => {
    for (const value of ['', undefined, null, 0, 'FOOBAR']) {
      const valueOrError = EmailSubscriptionRejectionLevel.create(value as string)

      expect(valueOrError.isFailed()).toBeTruthy()
    }
  })
})
