import { Result } from '@standardnotes/domain-core'

import { GetSettings } from '../GetSettings/GetSettings'
import { GetSubscriptionSettings } from '../GetSubscriptionSettings/GetSubscriptionSettings'
import { GetAllSettingsForUser } from './GetAllSettingsForUser'
import { GetSharedOrRegularSubscriptionForUser } from '../GetSharedOrRegularSubscriptionForUser/GetSharedOrRegularSubscriptionForUser'

describe('GetAllSettingsForUser', () => {
  let getSettings: GetSettings
  let getSharedOrRegularSubscription: GetSharedOrRegularSubscriptionForUser
  let getSubscriptionSettings: GetSubscriptionSettings

  const createUseCase = () =>
    new GetAllSettingsForUser(getSettings, getSharedOrRegularSubscription, getSubscriptionSettings)

  beforeEach(() => {
    getSettings = {} as jest.Mocked<GetSettings>
    getSettings.execute = jest.fn().mockReturnValue(Result.ok([]))

    getSharedOrRegularSubscription = {} as jest.Mocked<GetSharedOrRegularSubscriptionForUser>
    getSharedOrRegularSubscription.execute = jest
      .fn()
      .mockReturnValue(Result.ok({ uuid: '00000000-0000-0000-0000-000000000000' }))

    getSubscriptionSettings = {} as jest.Mocked<GetSubscriptionSettings>
    getSubscriptionSettings.execute = jest.fn().mockReturnValue(Result.ok([]))
  })

  it('should return settings for a user', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should fail if user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if getting settings fails', async () => {
    getSettings.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return just the settings if there is no subscription', async () => {
    getSharedOrRegularSubscription.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().subscriptionSettings).toEqual([])
  })

  it('should fail if getting subscription settings fails', async () => {
    getSubscriptionSettings.execute = jest.fn().mockReturnValue(Result.fail('error'))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
