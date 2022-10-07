import { inject, injectable } from 'inversify'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import {
  HttpStatusCode,
  UserRegistrationRequestParams,
  UserRegistrationResponse,
  UserServerInterface,
} from '@standardnotes/api'

import TYPES from '../Bootstrap/Types'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { Register } from '../Domain/UseCase/Register'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { ProtocolVersion } from '@standardnotes/common'

@injectable()
export class AuthController implements UserServerInterface {
  constructor(
    @inject(TYPES.ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.Register) private registerUser: Register,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async register(params: UserRegistrationRequestParams): Promise<UserRegistrationResponse> {
    if (!params.email || !params.password) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Please enter an email and a password to register.',
          },
        },
      }
    }

    const registerResult = await this.registerUser.execute({
      email: params.email,
      password: params.password,
      updatedWithUserAgent: params.userAgent as string,
      apiVersion: params.api,
      ephemeralSession: params.ephemeral,
      pwNonce: params.pw_nonce,
      kpOrigination: params.origination,
      kpCreated: params.created,
      version: params.version,
    })

    if (!registerResult.success) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: registerResult.errorMessage,
          },
        },
      }
    }

    await this.clearLoginAttempts.execute({ email: registerResult.authResponse.user.email as string })

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserRegisteredEvent({
        userUuid: <string>registerResult.authResponse.user.uuid,
        email: <string>registerResult.authResponse.user.email,
        protocolVersion: (<string>registerResult.authResponse.user.protocolVersion) as ProtocolVersion,
      }),
    )

    return {
      status: HttpStatusCode.Success,
      data: registerResult.authResponse,
    }
  }
}
