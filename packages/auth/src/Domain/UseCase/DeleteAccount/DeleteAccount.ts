import { Result, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { DeleteAccountDTO } from './DeleteAccountDTO'
import { User } from '../../User/User'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'

export class DeleteAccount implements UseCaseInterface<string> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private getRegularSubscription: GetRegularSubscriptionForUser,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private timer: TimerInterface,
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

    const roles = await user.roles

    let regularSubscriptionUuid: string | undefined
    const result = await this.getRegularSubscription.execute({
      userUuid: user.uuid,
    })
    if (!result.isFailed()) {
      const regularSubscription = result.getValue()
      regularSubscriptionUuid = regularSubscription.uuid
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createAccountDeletionRequestedEvent({
        userUuid: user.uuid,
        userCreatedAtTimestamp: this.timer.convertDateToMicroseconds(user.createdAt),
        regularSubscriptionUuid,
        roleNames: roles.map((role) => role.name),
      }),
    )

    return Result.ok('Successfully deleted account.')
  }
}
