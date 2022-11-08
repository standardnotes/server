import { SubscriptionEventType } from './SubscriptionEventType'

describe('SubscriptionEventType', () => {
  it('should create a value object', () => {
    const valueOrError = SubscriptionEventType.create('SUBSCRIPTION_PURCHASED')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('SUBSCRIPTION_PURCHASED')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = SubscriptionEventType.create('SUBSCRIPTION_REACTIVATED')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
