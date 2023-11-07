import 'reflect-metadata'

import { Role } from '@standardnotes/security'
import { SubscriptionName } from '@standardnotes/common'
import { RoleName } from '@standardnotes/domain-core'

import { RoleToSubscriptionMapInterface } from '../Role/RoleToSubscriptionMapInterface'
import { User } from '../User/User'
import { UserSubscription } from '../Subscription/UserSubscription'

jest.mock('@standardnotes/features', () => {
  const original = jest.requireActual('@standardnotes/features')

  return {
    ...original,
    GetFeatures: jest.fn().mockImplementation(() => [
      {
        identifier: 'org.standardnotes.theme-autobiography',
        permission_name: original.PermissionName.AutobiographyTheme,
        expires_at: 555,
      },
      {
        identifier: 'org.standardnotes.bold-editor',
        permission_name: original.PermissionName.BoldEditor,
        expires_at: 777,
      },
    ]),
  }
})
const { GetFeatures } = jest.requireMock('@standardnotes/features')

import { FeatureService } from './FeatureService'
import { FeatureIdentifier, Permission, PermissionName } from '@standardnotes/features'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { TimerInterface } from '@standardnotes/time'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'

describe('FeatureService', () => {
  let roleToSubscriptionMap: RoleToSubscriptionMapInterface
  let user: User
  let role1: Role
  let role2: Role
  let subscription1: UserSubscription
  let subscription2: UserSubscription
  let subscription3: UserSubscription
  let subscription4: UserSubscription
  let permission1: Permission
  let permission2: Permission
  let permission3: Permission
  let permission4: Permission
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let timer: TimerInterface
  let offlineUserSubscription: OfflineUserSubscription
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface

  const createService = () =>
    new FeatureService(roleToSubscriptionMap, offlineUserSubscriptionRepository, timer, userSubscriptionRepository)

  beforeEach(() => {
    roleToSubscriptionMap = {} as jest.Mocked<RoleToSubscriptionMapInterface>
    roleToSubscriptionMap.filterNonSubscriptionRoles = jest.fn().mockReturnValue([])
    roleToSubscriptionMap.getRoleNameForSubscriptionName = jest
      .fn()
      .mockImplementation((subscriptionName: SubscriptionName) => {
        if (subscriptionName === SubscriptionName.PlusPlan) {
          return RoleName.NAMES.PlusUser
        }
        if (subscriptionName === SubscriptionName.ProPlan) {
          return RoleName.NAMES.ProUser
        }

        return undefined
      })

    permission1 = {
      uuid: 'permission-1-1-1',
      name: PermissionName.AutobiographyTheme,
    }
    permission2 = {
      uuid: 'permission-2-2-2',
      name: PermissionName.BoldEditor,
    }
    permission3 = {
      uuid: 'permission-3-3-3',
      name: PermissionName.TwoFactorAuth,
    }
    permission4 = {
      uuid: 'permission-4-4-4',
      name: 'Not existing' as PermissionName,
    }

    role1 = {
      name: RoleName.NAMES.PlusUser,
      uuid: 'role-1-1-1',
      permissions: Promise.resolve([permission1, permission3]),
    } as jest.Mocked<Role>

    role2 = {
      name: RoleName.NAMES.ProUser,
      uuid: 'role-2-2-2',
      permissions: Promise.resolve([permission2]),
    } as jest.Mocked<Role>

    subscription1 = {
      uuid: 'subscription-1-1-1',
      createdAt: 111,
      updatedAt: 222,
      renewedAt: null,
      planName: SubscriptionName.PlusPlan,
      endsAt: 555,
      userUuid: 'user-1-1-1',
      cancelled: false,
      subscriptionId: 1,
      subscriptionType: UserSubscriptionType.Regular,
    }

    subscription2 = {
      uuid: 'subscription-2-2-2',
      createdAt: 222,
      updatedAt: 333,
      renewedAt: null,
      planName: SubscriptionName.ProPlan,
      endsAt: 777,
      userUuid: 'user-1-1-1',
      cancelled: false,
      subscriptionId: 2,
      subscriptionType: UserSubscriptionType.Regular,
    }

    subscription3 = {
      uuid: 'subscription-3-3-3-canceled',
      createdAt: 111,
      updatedAt: 222,
      renewedAt: null,
      planName: SubscriptionName.PlusPlan,
      endsAt: 333,
      userUuid: 'user-1-1-1',
      cancelled: true,
      subscriptionId: 3,
      subscriptionType: UserSubscriptionType.Regular,
    }

    subscription4 = {
      uuid: 'subscription-4-4-4-canceled',
      createdAt: 111,
      updatedAt: 222,
      renewedAt: null,
      planName: SubscriptionName.PlusPlan,
      endsAt: 333,
      userUuid: 'user-1-1-1',
      cancelled: true,
      subscriptionId: 4,
      subscriptionType: UserSubscriptionType.Regular,
    }

    user = {
      uuid: 'user-1-1-1',
      roles: Promise.resolve([role1]),
    } as jest.Mocked<User>

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([subscription1])

    offlineUserSubscription = {
      roles: Promise.resolve([role1]),
      uuid: 'subscription-1-1-1',
      createdAt: 111,
      updatedAt: 222,
      planName: SubscriptionName.PlusPlan,
      endsAt: 555,
      cancelled: false,
    } as jest.Mocked<OfflineUserSubscription>

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.findByEmail = jest.fn().mockReturnValue([offlineUserSubscription])

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)
  })

  describe('offline subscribers', () => {
    it('should return user features with `expires_at` field', async () => {
      const featuresResponse = await createService().getFeaturesForOfflineUser('test@test.com')

      expect(featuresResponse.features).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            identifier: 'org.standardnotes.theme-autobiography',
            expires_at: 555,
          }),
        ]),
      )
    })

    it('should not return user features if a subscription could not be found', async () => {
      offlineUserSubscriptionRepository.findByEmail = jest.fn().mockReturnValue([])

      expect(await createService().getFeaturesForOfflineUser('test@test.com')).toEqual({ features: [], roles: [] })
    })
  })

  describe('online subscribers', () => {
    it('should tell if a user is entitled to a feature', async () => {
      expect(await createService().userIsEntitledToFeature(user, FeatureIdentifier.AutobiographyTheme)).toBe(true)
      expect(await createService().userIsEntitledToFeature(user, FeatureIdentifier.DeprecatedBoldEditor)).toBe(false)
    })

    it('should tell if a user is not entitled to a feature because it is expired', async () => {
      timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(777)
      expect(await createService().userIsEntitledToFeature(user, FeatureIdentifier.AutobiographyTheme)).toBe(false)
    })

    it('should tell if a user is entitled to a feature that does not expire', async () => {
      const nonSubscriptionPermission = {
        uuid: 'files-beta-permission-1-1-1',
        name: 'files-beta' as PermissionName,
      } as jest.Mocked<Permission>

      GetFeatures.mockImplementation(() => [
        {
          identifier: 'org.standardnotes.theme-autobiography',
          permission_name: PermissionName.AutobiographyTheme,
          expires_at: 555,
        },
        {
          identifier: 'org.standardnotes.bold-editor',
          permission_name: PermissionName.BoldEditor,
          expires_at: 777,
        },
        {
          identifier: 'files-beta',
          permission_name: 'files-beta' as PermissionName,
          expires_at: undefined,
          no_expire: true,
        },
      ])

      const nonSubscriptionRole = {
        name: RoleName.NAMES.InternalTeamUser,
        uuid: 'role-files-beta',
        permissions: Promise.resolve([nonSubscriptionPermission]),
      } as jest.Mocked<Role>

      roleToSubscriptionMap.filterNonSubscriptionRoles = jest.fn().mockReturnValue([nonSubscriptionRole])
      roleToSubscriptionMap.getSubscriptionNameForRoleName = jest
        .fn()
        .mockReturnValueOnce(SubscriptionName.PlusPlan)
        .mockReturnValueOnce(SubscriptionName.ProPlan)

      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1, role2, nonSubscriptionRole]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([subscription1, subscription2])

      expect(await createService().userIsEntitledToFeature(user, 'files-beta')).toBe(true)
    })

    it('should return user features with `expires_at` field', async () => {
      const features = await createService().getFeaturesForUser(user)
      expect(features).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            identifier: 'org.standardnotes.theme-autobiography',
            expires_at: 555,
          }),
        ]),
      )
    })

    it('should return user features based on longest lasting subscription', async () => {
      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest
        .fn()
        .mockReturnValue([subscription3, subscription1, subscription4])

      const features = await createService().getFeaturesForUser(user)
      expect(features).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            identifier: 'org.standardnotes.theme-autobiography',
            expires_at: 555,
          }),
        ]),
      )
    })

    it('should not return user features if a subscription could not be found', async () => {
      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([])

      expect(await createService().getFeaturesForUser(user)).toEqual([])
    })

    it('should not return user features if those cannot be find for permissions', async () => {
      role1 = {
        name: RoleName.NAMES.CoreUser,
        uuid: 'role-1-1-1',
        permissions: Promise.resolve([permission4]),
      } as jest.Mocked<Role>

      roleToSubscriptionMap.filterNonSubscriptionRoles = jest.fn().mockReturnValue([role1])

      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest
        .fn()
        .mockReturnValue([subscription3, subscription1, subscription4])

      expect(await createService().getFeaturesForUser(user)).toEqual([])
    })

    it('should not return user features if a role name could not be found', async () => {
      subscription1 = {
        uuid: 'subscription-1-1-1',
        createdAt: 111,
        updatedAt: 222,
        renewedAt: null,
        planName: 'non existing plan name' as SubscriptionName,
        endsAt: 555,
        userUuid: 'user-1-1-1',
        cancelled: false,
        subscriptionId: 1,
        subscriptionType: UserSubscriptionType.Regular,
      }

      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([subscription1])

      expect(await createService().getFeaturesForUser(user)).toEqual([])
    })

    it('should not return user features if a role could not be found', async () => {
      user.roles = Promise.resolve([])

      expect(await createService().getFeaturesForUser(user)).toEqual([])
    })

    it('should return user features with `expires_at` field when user has more than 1 role & subscription', async () => {
      roleToSubscriptionMap.getSubscriptionNameForRoleName = jest
        .fn()
        .mockReturnValueOnce(SubscriptionName.PlusPlan)
        .mockReturnValueOnce(SubscriptionName.ProPlan)

      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1, role2]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([subscription1, subscription2])

      const features = await createService().getFeaturesForUser(user)
      expect(features).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            identifier: 'org.standardnotes.theme-autobiography',
            expires_at: 555,
          }),
          expect.objectContaining({
            identifier: 'org.standardnotes.bold-editor',
            expires_at: 777,
          }),
        ]),
      )
    })

    it('should return user features along with features related to non subscription roles', async () => {
      const nonSubscriptionPermission = {
        uuid: 'files-beta-permission-1-1-1',
        name: 'files-beta' as PermissionName,
      } as jest.Mocked<Permission>

      GetFeatures.mockImplementation(() => [
        {
          identifier: 'org.standardnotes.theme-autobiography',
          permission_name: PermissionName.AutobiographyTheme,
          expires_at: 555,
        },
        {
          identifier: 'org.standardnotes.bold-editor',
          permission_name: PermissionName.BoldEditor,
          expires_at: 777,
        },
        {
          identifier: 'files-beta',
          permission_name: 'files-beta' as PermissionName,
          expires_at: undefined,
          no_expire: true,
        },
      ])

      const nonSubscriptionRole = {
        name: RoleName.NAMES.InternalTeamUser,
        uuid: 'role-files-beta',
        permissions: Promise.resolve([nonSubscriptionPermission]),
      } as jest.Mocked<Role>

      roleToSubscriptionMap.filterNonSubscriptionRoles = jest.fn().mockReturnValue([nonSubscriptionRole])
      roleToSubscriptionMap.getSubscriptionNameForRoleName = jest
        .fn()
        .mockReturnValueOnce(SubscriptionName.PlusPlan)
        .mockReturnValueOnce(SubscriptionName.ProPlan)

      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1, role2, nonSubscriptionRole]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([subscription1, subscription2])

      const features = await createService().getFeaturesForUser(user)
      expect(features).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            identifier: 'org.standardnotes.theme-autobiography',
            expires_at: 555,
          }),
          expect.objectContaining({
            identifier: 'org.standardnotes.bold-editor',
            expires_at: 777,
          }),
          expect.objectContaining({
            expires_at: undefined,
            no_expire: true,
          }),
        ]),
      )
    })

    it('should set the longest expiration date for feature that matches duplicated permissions', async () => {
      roleToSubscriptionMap.getSubscriptionNameForRoleName = jest
        .fn()
        .mockReturnValueOnce(SubscriptionName.PlusPlan)
        .mockReturnValueOnce(SubscriptionName.ProPlan)

      role2 = {
        name: RoleName.NAMES.ProUser,
        uuid: 'role-2-2-2',
        permissions: Promise.resolve([permission1, permission2]),
      } as jest.Mocked<Role>
      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1, role2]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([subscription1, subscription2])

      const longestExpireAt = 777

      const features = await createService().getFeaturesForUser(user)
      expect(features).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            identifier: 'org.standardnotes.theme-autobiography',
            expires_at: longestExpireAt,
          }),
          expect.objectContaining({
            identifier: 'org.standardnotes.bold-editor',
            expires_at: longestExpireAt,
          }),
        ]),
      )
    })

    it('should not set the lesser expiration date for feature that matches duplicated permissions', async () => {
      roleToSubscriptionMap.getSubscriptionNameForRoleName = jest
        .fn()
        .mockReturnValueOnce(SubscriptionName.PlusPlan)
        .mockReturnValueOnce(SubscriptionName.ProPlan)

      const lesserExpireAt = 111
      subscription2.endsAt = lesserExpireAt

      role2 = {
        name: RoleName.NAMES.ProUser,
        uuid: 'role-2-2-2',
        permissions: Promise.resolve([permission1, permission2]),
      } as jest.Mocked<Role>
      user = {
        uuid: 'user-1-1-1',
        roles: Promise.resolve([role1, role2]),
      } as jest.Mocked<User>

      userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([subscription1, subscription2])

      const features = await createService().getFeaturesForUser(user)
      expect(features).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            identifier: 'org.standardnotes.theme-autobiography',
            expires_at: 555,
          }),
          expect.objectContaining({
            identifier: 'org.standardnotes.bold-editor',
            expires_at: lesserExpireAt,
          }),
        ]),
      )
    })
  })
})
