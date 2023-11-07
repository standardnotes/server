import { SubscriptionName } from '@standardnotes/common'
import { FeatureDescription, GetFeatures } from '@standardnotes/features'
import { TimerInterface } from '@standardnotes/time'

import { RoleToSubscriptionMapInterface } from '../Role/RoleToSubscriptionMapInterface'
import { User } from '../User/User'
import { UserSubscription } from '../Subscription/UserSubscription'
import { FeatureServiceInterface } from './FeatureServiceInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { Role } from '../Role/Role'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'

export class FeatureService implements FeatureServiceInterface {
  constructor(
    private roleToSubscriptionMap: RoleToSubscriptionMapInterface,
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    private timer: TimerInterface,
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  ) {}

  async userIsEntitledToFeature(user: User, featureIdentifier: string): Promise<boolean> {
    const userFeatures = await this.getFeaturesForUser(user)

    const feature = userFeatures.find((userFeature) => userFeature.identifier === featureIdentifier)

    if (feature === undefined) {
      return false
    }

    if (feature.no_expire) {
      return true
    }

    const featureIsExpired =
      feature.expires_at !== undefined && feature.expires_at < this.timer.getTimestampInMicroseconds()

    return !featureIsExpired
  }

  async getFeaturesForOfflineUser(email: string): Promise<{ features: FeatureDescription[]; roles: string[] }> {
    const userSubscriptions = await this.offlineUserSubscriptionRepository.findByEmail(
      email,
      this.timer.getTimestampInMicroseconds(),
    )
    const userRolesMap: Map<string, Role> = new Map()
    for (const userSubscription of userSubscriptions) {
      const subscriptionRoles = await userSubscription.roles
      for (const subscriptionRole of subscriptionRoles) {
        userRolesMap.set(subscriptionRole.name, subscriptionRole)
      }
    }

    const roles = [...userRolesMap.values()]
    return {
      features: await this.getFeaturesForSubscriptions(userSubscriptions, roles),
      roles: roles.map((role) => role.name),
    }
  }

  async getFeaturesForUser(user: User): Promise<Array<FeatureDescription>> {
    const userSubscriptions = await this.userSubscriptionRepository.findByUserUuid(user.uuid)

    return this.getFeaturesForSubscriptions(userSubscriptions, await user.roles)
  }

  private async getFeaturesForSubscriptions(
    userSubscriptions: Array<UserSubscription | OfflineUserSubscription>,
    userRoles: Array<Role>,
  ): Promise<Array<FeatureDescription>> {
    const userFeatures: Map<string, FeatureDescription> = new Map()

    await this.appendFeaturesBasedOnSubscriptions(userSubscriptions, userRoles, userFeatures)

    await this.appendFeaturesBasedOnNonSubscriptionRoles(userRoles, userFeatures)

    return [...userFeatures.values()]
  }

  private async appendFeaturesBasedOnNonSubscriptionRoles(
    userRoles: Array<Role>,
    userFeatures: Map<string, FeatureDescription>,
  ): Promise<void> {
    const nonSubscriptionRolesOfUser = this.roleToSubscriptionMap.filterNonSubscriptionRoles(userRoles)

    for (const nonSubscriptionRole of nonSubscriptionRolesOfUser) {
      await this.appendFeaturesAssociatedWithRole(nonSubscriptionRole, userFeatures)
    }
  }

  private async appendFeaturesBasedOnSubscriptions(
    userSubscriptions: Array<UserSubscription | OfflineUserSubscription>,
    userRoles: Array<Role>,
    userFeatures: Map<string, FeatureDescription>,
  ): Promise<void> {
    const userSubscriptionNames: Array<SubscriptionName> = []

    userSubscriptions.map((userSubscription: UserSubscription | OfflineUserSubscription) => {
      const subscriptionName = userSubscription.planName as SubscriptionName
      if (!userSubscriptionNames.includes(subscriptionName)) {
        userSubscriptionNames.push(subscriptionName)
      }
    })

    for (const userSubscriptionName of userSubscriptionNames) {
      const roleName = this.roleToSubscriptionMap.getRoleNameForSubscriptionName(userSubscriptionName)
      if (roleName === undefined) {
        continue
      }
      const role = userRoles.find((role: Role) => role.name === roleName)
      if (role === undefined) {
        continue
      }

      const longestLastingSubscription = this.getLongestLastingSubscription(userSubscriptions, userSubscriptionName)

      await this.appendFeaturesAssociatedWithRole(role, userFeatures, longestLastingSubscription)
    }
  }

  private async appendFeaturesAssociatedWithRole(
    role: Role,
    userFeatures: Map<string, FeatureDescription>,
    longestLastingSubscription?: UserSubscription | OfflineUserSubscription,
  ): Promise<void> {
    const rolePermissions = await role.permissions
    for (const rolePermission of rolePermissions) {
      const featureForPermission = GetFeatures().find(
        (feature) => feature.permission_name === rolePermission.name,
      ) as FeatureDescription
      if (featureForPermission === undefined) {
        continue
      }

      const alreadyAddedFeature = userFeatures.get(rolePermission.name)
      if (alreadyAddedFeature === undefined) {
        userFeatures.set(rolePermission.name, {
          ...featureForPermission,
          expires_at: longestLastingSubscription ? longestLastingSubscription.endsAt : undefined,
          no_expire: longestLastingSubscription ? false : true,
          role_name: role.name,
        })

        continue
      }

      if (
        longestLastingSubscription !== undefined &&
        longestLastingSubscription.endsAt > (alreadyAddedFeature.expires_at as number)
      ) {
        alreadyAddedFeature.expires_at = longestLastingSubscription.endsAt
      }
    }
  }

  private getLongestLastingSubscription(
    userSubscriptions: Array<UserSubscription | OfflineUserSubscription>,
    subscriptionName?: SubscriptionName,
  ): UserSubscription | OfflineUserSubscription {
    return userSubscriptions
      .filter((subscription) => subscription.planName === subscriptionName)
      .sort((a, b) => {
        if (a.endsAt < b.endsAt) {
          return 1
        }
        if (a.endsAt > b.endsAt) {
          return -1
        }
        return 0
      })[0]
  }
}
