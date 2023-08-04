import * as bcrypt from 'bcryptjs'
import { inject, injectable } from 'inversify'
import { DomainEventPublisherInterface, UserEmailChangedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { Result, UseCaseInterface, Username } from '@standardnotes/domain-core'

import TYPES from '../../../Bootstrap/Types'
import { AuthResponseFactoryResolverInterface } from '../../Auth/AuthResponseFactoryResolverInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { ChangeCredentialsDTO } from './ChangeCredentialsDTO'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { DeleteOtherSessionsForUser } from '../DeleteOtherSessionsForUser'
import { AuthResponse20161215 } from '../../Auth/AuthResponse20161215'
import { AuthResponse20200115 } from '../../Auth/AuthResponse20200115'

@injectable()
export class ChangeCredentials implements UseCaseInterface<AuthResponse20161215 | AuthResponse20200115> {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_AuthResponseFactoryResolver)
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
    @inject(TYPES.Auth_DeleteOtherSessionsForUser)
    private deleteOtherSessionsForUserUseCase: DeleteOtherSessionsForUser,
  ) {}

  async execute(dto: ChangeCredentialsDTO): Promise<Result<AuthResponse20161215 | AuthResponse20200115>> {
    const user = await this.userRepository.findOneByUsernameOrEmail(dto.username)
    if (!user) {
      return Result.fail('User not found.')
    }

    if (!(await bcrypt.compare(dto.currentPassword, user.encryptedPassword))) {
      return Result.fail('The current password you entered is incorrect. Please try again.')
    }

    user.encryptedPassword = await bcrypt.hash(dto.newPassword, User.PASSWORD_HASH_COST)

    let userEmailChangedEvent: UserEmailChangedEvent | undefined = undefined
    if (dto.newEmail !== undefined) {
      const newUsernameOrError = Username.create(dto.newEmail)
      if (newUsernameOrError.isFailed()) {
        return Result.fail(newUsernameOrError.getError())
      }
      const newUsername = newUsernameOrError.getValue()

      const existingUser = await this.userRepository.findOneByUsernameOrEmail(newUsername)
      if (existingUser !== null) {
        return Result.fail('The email you entered is already taken. Please try again.')
      }

      userEmailChangedEvent = this.domainEventFactory.createUserEmailChangedEvent(
        user.uuid,
        user.email,
        newUsername.value,
      )

      user.email = newUsername.value
    }

    user.pwNonce = dto.pwNonce
    if (dto.protocolVersion) {
      user.version = dto.protocolVersion
    }
    if (dto.kpCreated) {
      user.kpCreated = dto.kpCreated
    }
    if (dto.kpOrigination) {
      user.kpOrigination = dto.kpOrigination
    }
    user.updatedAt = this.timer.getUTCDate()

    const updatedUser = await this.userRepository.save(user)

    if (userEmailChangedEvent !== undefined) {
      await this.domainEventPublisher.publish(userEmailChangedEvent)
    }

    await this.deleteOtherSessionsForUserIfNeeded(user.uuid, dto)

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(dto.apiVersion)

    const authResponse = await authResponseFactory.createResponse({
      user: updatedUser,
      apiVersion: dto.apiVersion,
      userAgent: dto.updatedWithUserAgent,
      ephemeralSession: false,
      readonlyAccess: false,
    })

    return Result.ok(authResponse)
  }

  private async deleteOtherSessionsForUserIfNeeded(userUuid: string, dto: ChangeCredentialsDTO): Promise<void> {
    const passwordHasChanged = dto.newPassword !== dto.currentPassword
    const userEmailChanged = dto.newEmail !== undefined

    if (passwordHasChanged || userEmailChanged) {
      await this.deleteOtherSessionsForUserUseCase.execute({
        userUuid,
        currentSessionUuid: dto.currentSessionUuid,
        markAsRevoked: false,
      })
    }
  }
}
