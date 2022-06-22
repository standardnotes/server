import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
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
  ) {}

  async execute(dto: DeleteAccountDTO): Promise<DeleteAccountResponse> {
    const user = await this.userRepository.findOneByEmail(dto.email)

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
