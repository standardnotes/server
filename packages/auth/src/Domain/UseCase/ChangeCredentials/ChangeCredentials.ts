import * as bcrypt from 'bcryptjs'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { AuthResponseFactoryResolverInterface } from '../../Auth/AuthResponseFactoryResolverInterface'

import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { ChangeCredentialsDTO } from './ChangeCredentialsDTO'
import { ChangeCredentialsResponse } from './ChangeCredentialsResponse'
import { UseCaseInterface } from '../UseCaseInterface'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { DomainEventPublisherInterface, UserEmailChangedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { Username } from '@standardnotes/domain-core'

@injectable()
export class ChangeCredentials implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_AuthResponseFactoryResolver)
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: ChangeCredentialsDTO): Promise<ChangeCredentialsResponse> {
    const user = await this.userRepository.findOneByUsernameOrEmail(dto.username)
    if (!user) {
      return {
        success: false,
        errorMessage: 'User not found.',
      }
    }

    if (!(await bcrypt.compare(dto.currentPassword, user.encryptedPassword))) {
      return {
        success: false,
        errorMessage: 'The current password you entered is incorrect. Please try again.',
      }
    }

    user.encryptedPassword = await bcrypt.hash(dto.newPassword, User.PASSWORD_HASH_COST)

    let userEmailChangedEvent: UserEmailChangedEvent | undefined = undefined
    if (dto.newEmail !== undefined) {
      const newUsernameOrError = Username.create(dto.newEmail)
      if (newUsernameOrError.isFailed()) {
        return {
          success: false,
          errorMessage: newUsernameOrError.getError(),
        }
      }
      const newUsername = newUsernameOrError.getValue()

      const existingUser = await this.userRepository.findOneByUsernameOrEmail(newUsername)
      if (existingUser !== null) {
        return {
          success: false,
          errorMessage: 'The email you entered is already taken. Please try again.',
        }
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

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(dto.apiVersion)

    return {
      success: true,
      authResponse: await authResponseFactory.createResponse({
        user: updatedUser,
        apiVersion: dto.apiVersion,
        userAgent: dto.updatedWithUserAgent,
        ephemeralSession: false,
        readonlyAccess: false,
      }),
    }
  }
}
