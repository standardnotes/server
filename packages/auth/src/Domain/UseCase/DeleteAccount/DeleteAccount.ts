import { Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { DeleteAccountDTO } from './DeleteAccountDTO'
import { DeleteAccountResponse } from './DeleteAccountResponse'

@injectable()
export class DeleteAccount implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: DeleteAccountDTO): Promise<DeleteAccountResponse> {
    const uuidOrError = Uuid.create(dto.userUuid)
    if (uuidOrError.isFailed()) {
      return {
        success: false,
        responseCode: 400,
        message: uuidOrError.getError(),
      }
    }
    const uuid = uuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(uuid)

    if (user === null) {
      return {
        success: false,
        responseCode: 404,
        message: 'User not found',
      }
    }

    let regularSubscriptionUuid = undefined
    const { regularSubscription } = await this.userSubscriptionService.findRegularSubscriptionForUserUuid(user.uuid)
    if (regularSubscription !== null) {
      regularSubscriptionUuid = regularSubscription.uuid
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createAccountDeletionRequestedEvent({
        userUuid: user.uuid,
        userCreatedAtTimestamp: this.timer.convertDateToMicroseconds(user.createdAt),
        regularSubscriptionUuid,
      }),
    )

    return {
      success: true,
      message: 'Successfully deleted user',
      responseCode: 200,
    }
  }
}
