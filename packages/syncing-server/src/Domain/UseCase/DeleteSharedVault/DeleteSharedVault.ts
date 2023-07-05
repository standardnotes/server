import { NotificationType, Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DeleteSharedVaultDTO } from './DeleteSharedVaultDTO'
import { SharedVaultRepositoryInterface } from '../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { SharedVaultInviteRepositoryInterface } from '../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class DeleteSharedVault implements UseCaseInterface<void> {
  constructor(
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: DeleteSharedVaultDTO): Promise<Result<void>> {
    const originatorUuidOrError = Uuid.create(dto.originatorUuid)
    if (originatorUuidOrError.isFailed()) {
      return Result.fail(originatorUuidOrError.getError())
    }
    const originatorUuid = originatorUuidOrError.getValue()

    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail('Shared vault not found')
    }

    if (sharedVault.props.userUuid.value !== originatorUuid.value) {
      return Result.fail('Shared vault does not belong to the user')
    }

    const sharedVaultUsers = await this.sharedVaultUserRepository.findBySharedVaultUuid(sharedVaultUuid)
    for (const sharedVaultUser of sharedVaultUsers) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createNotificationRequestedEvent({
          payload: JSON.stringify({
            sharedVaultUuid: sharedVault.id.toString(),
            version: '1.0',
          }),
          userUuid: sharedVaultUser.props.userUuid.value,
          type: NotificationType.TYPES.RemovedFromSharedVault,
        }),
      )
    }

    await this.sharedVaultInviteRepository.removeBySharedVaultUuid(sharedVaultUuid)

    await this.sharedVaultUserRepository.removeBySharedVaultUuid(sharedVaultUuid)

    await this.sharedVaultRepository.remove(sharedVault)

    return Result.ok()
  }
}
