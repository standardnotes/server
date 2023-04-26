import { Username } from '@standardnotes/domain-core'
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
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: DeleteAccountDTO): Promise<DeleteAccountResponse> {
    const usernameOrError = Username.create(dto.email)
    if (usernameOrError.isFailed()) {
      return {
        success: false,
        responseCode: 400,
        message: usernameOrError.getError(),
      }
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

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
