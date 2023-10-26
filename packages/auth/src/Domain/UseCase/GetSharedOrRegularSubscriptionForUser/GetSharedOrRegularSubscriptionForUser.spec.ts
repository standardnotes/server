import { Result } from '@standardnotes/domain-core'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { GetSharedOrRegularSubscriptionForUser } from './GetSharedOrRegularSubscriptionForUser'

describe('GetSharedOrRegularSubscriptionForUser', () => {
  let getRegularSubscriptionForUser: GetRegularSubscriptionForUser
  let getSharedSubscriptionForUser: GetSharedSubscriptionForUser

  const createUseCase = () =>
    new GetSharedOrRegularSubscriptionForUser(getRegularSubscriptionForUser, getSharedSubscriptionForUser)

  beforeEach(() => {
    getRegularSubscriptionForUser = {} as jest.Mocked<GetRegularSubscriptionForUser>
    getRegularSubscriptionForUser.execute = jest
      .fn()
      .mockReturnValue(Result.ok({ subscriptionType: UserSubscriptionType.Regular } as jest.Mocked<UserSubscription>))

    getSharedSubscriptionForUser = {} as jest.Mocked<GetSharedSubscriptionForUser>
    getSharedSubscriptionForUser.execute = jest
      .fn()
      .mockReturnValue(Result.ok({ subscriptionType: UserSubscriptionType.Shared } as jest.Mocked<UserSubscription>))
  })

  it('should return a shared subscription', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().subscriptionType).toEqual(UserSubscriptionType.Shared)
  })

  it('should return a regular subscription', async () => {
    getSharedSubscriptionForUser.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().subscriptionType).toEqual(UserSubscriptionType.Regular)
  })

  it('should return error if both shared and regular subscriptions are not found', async () => {
    getSharedSubscriptionForUser.execute = jest.fn().mockReturnValue(Result.fail('not found'))
    getRegularSubscriptionForUser.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
