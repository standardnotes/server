import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  UserInvitedToSharedVaultEvent,
} from '@standardnotes/domain-events'
import { EmailLevel, Uuid } from '@standardnotes/domain-core'

import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { getBody, getSubject } from '../Email/UserInvitedToSharedVault'

export class UserInvitedToSharedVaultEventHandler implements DomainEventHandlerInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async handle(event: UserInvitedToSharedVaultEvent): Promise<void> {
    const userUuidOrError = Uuid.create(event.payload.invite.user_uuid)
    if (userUuidOrError.isFailed()) {
      return
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)
    if (!user) {
      return
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailRequestedEvent({
        body: getBody(),
        level: EmailLevel.LEVELS.System,
        subject: getSubject(),
        messageIdentifier: 'USER_INVITED_TO_SHARED_VAULT',
        userEmail: user.email,
        userUuid: user.uuid,
      }),
    )
  }
}
