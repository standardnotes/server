import { TimerInterface } from '@standardnotes/time'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import {
  Result,
  SharedVaultUser,
  SharedVaultUserPermission,
  Timestamps,
  UseCaseInterface,
  Uuid,
} from '@standardnotes/domain-core'

import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { DesignateSurvivorDTO } from './DesignateSurvivorDTO'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'

export class DesignateSurvivor implements UseCaseInterface<void> {
  constructor(
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private timer: TimerInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async execute(dto: DesignateSurvivorDTO): Promise<Result<void>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const originatorUuidOrError = Uuid.create(dto.originatorUuid)
    if (originatorUuidOrError.isFailed()) {
      return Result.fail(originatorUuidOrError.getError())
    }
    const originatorUuid = originatorUuidOrError.getValue()

    const sharedVaultUsers = await this.sharedVaultUserRepository.findBySharedVaultUuid(sharedVaultUuid)
    let sharedVaultExistingSurvivor: SharedVaultUser | undefined
    let toBeDesignatedAsASurvivor: SharedVaultUser | undefined
    let isOriginatorTheOwner = false
    for (const sharedVaultUser of sharedVaultUsers) {
      if (sharedVaultUser.props.userUuid.equals(userUuid)) {
        toBeDesignatedAsASurvivor = sharedVaultUser
      }
      if (sharedVaultUser.props.isDesignatedSurvivor) {
        sharedVaultExistingSurvivor = sharedVaultUser
      }
      if (
        sharedVaultUser.props.userUuid.equals(originatorUuid) &&
        sharedVaultUser.props.permission.value === SharedVaultUserPermission.PERMISSIONS.Admin
      ) {
        isOriginatorTheOwner = true
      }
    }

    if (!isOriginatorTheOwner) {
      return Result.fail('Only the owner can designate a survivor')
    }

    if (!toBeDesignatedAsASurvivor) {
      return Result.fail('Attempting to designate a survivor for a non-member')
    }

    if (sharedVaultExistingSurvivor) {
      sharedVaultExistingSurvivor.props.isDesignatedSurvivor = false
      sharedVaultExistingSurvivor.props.timestamps = Timestamps.create(
        sharedVaultExistingSurvivor.props.timestamps.createdAt,
        this.timer.getTimestampInMicroseconds(),
      ).getValue()
      await this.sharedVaultUserRepository.save(sharedVaultExistingSurvivor)
    }

    toBeDesignatedAsASurvivor.props.isDesignatedSurvivor = true
    toBeDesignatedAsASurvivor.props.timestamps = Timestamps.create(
      toBeDesignatedAsASurvivor.props.timestamps.createdAt,
      this.timer.getTimestampInMicroseconds(),
    ).getValue()

    await this.sharedVaultUserRepository.save(toBeDesignatedAsASurvivor)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserDesignatedAsSurvivorInSharedVaultEvent({
        sharedVaultUuid: sharedVaultUuid.value,
        userUuid: userUuid.value,
        timestamp: this.timer.getTimestampInMicroseconds(),
      }),
    )

    return Result.ok()
  }
}
