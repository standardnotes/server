import { SubscriptionPlanName, Username, Uuid } from '@standardnotes/domain-core'
import { SessionTrace } from './SessionTrace'

describe('SessionTrace', () => {
  it('should create an entity', () => {
    const entityOrError = SessionTrace.create({
      userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
      username: Username.create('foobar').getValue(),
      subscriptionPlanName: SubscriptionPlanName.create(SubscriptionPlanName.NAMES.PlusPlan).getValue(),
      createdAt: new Date(),
      expiresAt: new Date(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
