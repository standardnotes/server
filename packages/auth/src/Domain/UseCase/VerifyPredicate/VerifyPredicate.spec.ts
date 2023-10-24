import 'reflect-metadata'

import { PredicateName, PredicateVerificationResult, PredicateAuthority } from '@standardnotes/predicates'

import { Setting } from '../../Setting/Setting'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'

import { VerifyPredicate } from './VerifyPredicate'
import { EmailBackupFrequency, SettingName } from '@standardnotes/settings'
import { Uuid, Timestamps } from '@standardnotes/domain-core'

describe('VerifyPredicate', () => {
  let settingRepository: SettingRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let subscription: UserSubscription
  let setting: Setting

  const createUseCase = () => new VerifyPredicate(settingRepository, userSubscriptionRepository)

  beforeEach(() => {
    setting = {} as jest.Mocked<Setting>

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    subscription = {} as jest.Mocked<UserSubscription>
    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(subscription)
  })

  it('should tell that a user has enabled email backups', async () => {
    const setting = Setting.create({
      name: SettingName.NAMES.EmailBackupFrequency,
      value: EmailBackupFrequency.Weekly,
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    expect(
      await createUseCase().execute({
        predicate: { jobUuid: '2-3-4', authority: PredicateAuthority.Auth, name: PredicateName.EmailBackupsEnabled },
        userUuid: '1-2-3',
      }),
    ).toEqual({
      predicateVerificationResult: PredicateVerificationResult.Affirmed,
    })
  })

  it('should tell that a user has disabled email backups', async () => {
    const setting = Setting.create({
      name: SettingName.NAMES.EmailBackupFrequency,
      value: EmailBackupFrequency.Disabled,
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue(setting)

    expect(
      await createUseCase().execute({
        predicate: { jobUuid: '2-3-4', authority: PredicateAuthority.Auth, name: PredicateName.EmailBackupsEnabled },
        userUuid: '1-2-3',
      }),
    ).toEqual({
      predicateVerificationResult: PredicateVerificationResult.Denied,
    })
  })

  it('should tell that a user has disabled email backups - missing setting', async () => {
    settingRepository.findOneByNameAndUserUuid = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        predicate: { jobUuid: '2-3-4', authority: PredicateAuthority.Auth, name: PredicateName.EmailBackupsEnabled },
        userUuid: '1-2-3',
      }),
    ).toEqual({
      predicateVerificationResult: PredicateVerificationResult.Denied,
    })
  })

  it('should tell that a user has a subscription', async () => {
    expect(
      await createUseCase().execute({
        predicate: { jobUuid: '2-3-4', authority: PredicateAuthority.Auth, name: PredicateName.SubscriptionPurchased },
        userUuid: '1-2-3',
      }),
    ).toEqual({
      predicateVerificationResult: PredicateVerificationResult.Affirmed,
    })
  })

  it('should tell that a user has no subscription', async () => {
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        predicate: { jobUuid: '2-3-4', authority: PredicateAuthority.Auth, name: PredicateName.SubscriptionPurchased },
        userUuid: '1-2-3',
      }),
    ).toEqual({
      predicateVerificationResult: PredicateVerificationResult.Denied,
    })
  })

  it('should throw error upon not recognized predicate', async () => {
    let caughtError = null
    try {
      await createUseCase().execute({
        predicate: { jobUuid: '2-3-4', authority: PredicateAuthority.Auth, name: 'foobar' as PredicateName },
        userUuid: '1-2-3',
      })
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.toBeNull()
  })
})
