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
import {
  DomainEventPublisherInterface,
  UserCredentialsChangedEvent,
  UserEmailChangedEvent,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { Username } from '@standardnotes/domain-core'

@injectable()
export class ChangeCredentials implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.AuthResponseFactoryResolver)
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: ChangeCredentialsDTO): Promise<ChangeCredentialsResponse> {
    if (!(await bcrypt.compare(dto.currentPassword, dto.user.encryptedPassword))) {
      return {
        success: false,
        errorMessage: 'The current password you entered is incorrect. Please try again.',
      }
    }

    dto.user.encryptedPassword = await bcrypt.hash(dto.newPassword, User.PASSWORD_HASH_COST)

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
        dto.user.uuid,
        dto.user.email,
        newUsername.value,
      )

      dto.user.email = newUsername.value
    }

    let userCredentialsChangedEvent: UserCredentialsChangedEvent | undefined = undefined

    if (dto.publicKey && dto.user.publicKey !== dto.publicKey) {
      if (!dto.signingPublicKey) {
        return {
          success: false,
          errorMessage: 'Signing public key is required',
        }
      }

      dto.user.publicKey = dto.publicKey
      dto.user.signingPublicKey = dto.signingPublicKey
      userCredentialsChangedEvent = this.domainEventFactory.createUserCredentialsChangedEvent(
        dto.user.uuid,
        dto.publicKey,
        dto.signingPublicKey,
      )
    }

    if (dto.encryptedPrivateKey) {
      dto.user.encryptedPrivateKey = dto.encryptedPrivateKey
    }

    if (dto.encryptedSigningPrivateKey) {
      dto.user.encryptedSigningPrivateKey = dto.encryptedSigningPrivateKey
    }

    dto.user.pwNonce = dto.pwNonce
    if (dto.protocolVersion) {
      dto.user.version = dto.protocolVersion
    }
    if (dto.kpCreated) {
      dto.user.kpCreated = dto.kpCreated
    }
    if (dto.kpOrigination) {
      dto.user.kpOrigination = dto.kpOrigination
    }
    dto.user.updatedAt = this.timer.getUTCDate()

    const updatedUser = await this.userRepository.save(dto.user)

    if (userEmailChangedEvent !== undefined) {
      await this.domainEventPublisher.publish(userEmailChangedEvent)
    }

    if (userCredentialsChangedEvent != undefined) {
      await this.domainEventPublisher.publish(userCredentialsChangedEvent)
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
