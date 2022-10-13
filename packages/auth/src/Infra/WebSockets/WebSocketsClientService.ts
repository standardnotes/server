import { RoleName } from '@standardnotes/common'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Domain/Event/DomainEventFactoryInterface'
import { User } from '../../Domain/User/User'
import { ClientServiceInterface } from '../../Domain/Client/ClientServiceInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

@injectable()
export class WebSocketsClientService implements ClientServiceInterface {
  constructor(
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async sendUserRolesChangedEvent(user: User): Promise<void> {
    const event = this.domainEventFactory.createUserRolesChangedEvent(
      user.uuid,
      user.email,
      (await user.roles).map((role) => role.name) as RoleName[],
    )

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createWebSocketMessageRequestedEvent({
        userUuid: user.uuid,
        message: JSON.stringify(event),
      }),
    )
  }
}
