import { SubscriptionPlanName } from './SubscriptionPlanName'

describe('SubscriptionPlanName', () => {
  it('should create a value object', () => {
    const valueOrError = SubscriptionPlanName.create('PRO_PLAN')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('PRO_PLAN')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = SubscriptionPlanName.create('TEST')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
