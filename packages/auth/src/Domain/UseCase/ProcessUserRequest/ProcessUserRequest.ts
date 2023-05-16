import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { UserRequestType } from '@standardnotes/common'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'

import { UseCaseInterface } from '../UseCaseInterface'
import { ProcessUserRequestDTO } from './ProcessUserRequestDTO'
import { ProcessUserRequestResponse } from './ProcessUserRequestResponse'

@injectable()
export class ProcessUserRequest implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async execute(dto: ProcessUserRequestDTO): Promise<ProcessUserRequestResponse> {
    if (dto.requestType !== UserRequestType.ExitDiscount) {
      return {
        success: false,
      }
    }

    const subscription = await this.userSubscriptionRepository.findOneByUserUuid(dto.userUuid)
    if (subscription === null || !subscription.cancelled) {
      return {
        success: false,
      }
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createExitDiscountApplyRequestedEvent({
        userEmail: dto.userEmail,
        discountCode: 'exit-20',
      }),
    )

    return {
      success: true,
    }
  }
}
