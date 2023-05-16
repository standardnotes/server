import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateListedAccountDTO } from './CreateListedAccountDTO'
import { CreateListedAccountResponse } from './CreateListedAccountResponse'

@injectable()
export class CreateListedAccount implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: CreateListedAccountDTO): Promise<CreateListedAccountResponse> {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createListedAccountRequestedEvent(dto.userUuid, dto.userEmail),
    )

    return {
      success: true,
    }
  }
}
