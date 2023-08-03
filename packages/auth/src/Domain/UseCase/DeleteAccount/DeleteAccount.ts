import { Result, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { DeleteAccountDTO } from './DeleteAccountDTO'
import { User } from '../../User/User'

@injectable()
export class DeleteAccount implements UseCaseInterface<string> {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: DeleteAccountDTO): Promise<Result<string>> {
    let user: User | null = null
    if (dto.userUuid !== undefined) {
      const uuidOrError = Uuid.create(dto.userUuid)
      if (uuidOrError.isFailed()) {
        return Result.fail(uuidOrError.getError())
      }
      const uuid = uuidOrError.getValue()

      user = await this.userRepository.findOneByUuid(uuid)
    } else if (dto.username !== undefined) {
      const usernameOrError = Username.create(dto.username)
      if (usernameOrError.isFailed()) {
        return Result.fail(usernameOrError.getError())
      }
      const username = usernameOrError.getValue()

      user = await this.userRepository.findOneByUsernameOrEmail(username)
    } else {
      return Result.fail('Either userUuid or username must be provided.')
    }

    if (user === null) {
      return Result.fail('User not found.')
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

    return Result.ok('Successfully deleted account.')
  }
}
