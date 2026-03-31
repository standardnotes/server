import { Result, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { DeleteAccountDTO } from './DeleteAccountDTO'
import { User } from '../../User/User'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { VerifyUserServerPassword } from '../VerifyUserServerPassword/VerifyUserServerPassword'

export class DeleteAccount implements UseCaseInterface<string> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private getRegularSubscription: GetRegularSubscriptionForUser,
    private getSharedSubscription: GetSharedSubscriptionForUser,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private timer: TimerInterface,
    private verifyUserServerPassword: VerifyUserServerPassword,
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
      return Result.ok('User already deleted.')
    }

    if (dto.shouldVerifyUserServerPassword) {
      const verifyUserServerPasswordResult = await this.verifyUserServerPassword.execute({
        user,
        serverPassword: dto.serverPassword,
        authTokenVersion: dto.authTokenVersion,
      })

      if (verifyUserServerPasswordResult.isFailed()) {
        return Result.fail(verifyUserServerPasswordResult.getError())
      }
    }

    let sharedSubscription: UserSubscription | undefined
    const sharedSubscriptionOrError = await this.getSharedSubscription.execute({
      userUuid: user.uuid,
    })
    if (!sharedSubscriptionOrError.isFailed()) {
      sharedSubscription = sharedSubscriptionOrError.getValue()
    }

    let regularSubscription: UserSubscription | undefined
    const regularSubscriptionOrError = await this.getRegularSubscription.execute({
      userUuid: user.uuid,
    })
    if (!regularSubscriptionOrError.isFailed()) {
      regularSubscription = regularSubscriptionOrError.getValue()
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createAccountDeletionRequestedEvent({
        userUuid: user.uuid,
        email: user.email,
        userCreatedAtTimestamp: this.timer.convertDateToMicroseconds(user.createdAt),
        regularSubscription: regularSubscription
          ? {
              ownerUuid: regularSubscription.userUuid,
              uuid: regularSubscription.uuid,
            }
          : undefined,
        sharedSubscription: sharedSubscription
          ? {
              ownerUuid: sharedSubscription.userUuid,
              uuid: sharedSubscription.uuid,
            }
          : undefined,
      }),
    )

    return Result.ok('Successfully deleted account.')
  }
}
