import { inject, injectable } from 'inversify'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import {
  ApiVersion,
  UserRegistrationRequestParams,
  UserServerInterface,
  UserDeletionResponseBody,
  UserRegistrationResponseBody,
} from '@standardnotes/api'
import { HttpResponse, HttpStatusCode } from '@standardnotes/responses'
import { ProtocolVersion } from '@standardnotes/common'

import TYPES from '../Bootstrap/Types'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { Register } from '../Domain/UseCase/Register'
import { DomainEventFactoryInterface } from '../Domain/Event/DomainEventFactoryInterface'
import { SignInWithRecoveryCodes } from '../Domain/UseCase/SignInWithRecoveryCodes/SignInWithRecoveryCodes'
import { SignInWithRecoveryCodesRequestParams } from '../Infra/Http/Request/SignInWithRecoveryCodesRequestParams'
import { GetUserKeyParamsRecovery } from '../Domain/UseCase/GetUserKeyParamsRecovery/GetUserKeyParamsRecovery'
import { RecoveryKeyParamsRequestParams } from '../Infra/Http/Request/RecoveryKeyParamsRequestParams'
import { SignInWithRecoveryCodesResponseBody } from '../Infra/Http/Response/SignInWithRecoveryCodesResponseBody'
import { RecoveryKeyParamsResponseBody } from '../Infra/Http/Response/RecoveryKeyParamsResponseBody'
import { GenerateRecoveryCodesResponseBody } from '../Infra/Http/Response/GenerateRecoveryCodesResponseBody'
import { GenerateRecoveryCodes } from '../Domain/UseCase/GenerateRecoveryCodes/GenerateRecoveryCodes'
import { GenerateRecoveryCodesRequestParams } from '../Infra/Http/Request/GenerateRecoveryCodesRequestParams'
import { Logger } from 'winston'

@injectable()
export class AuthController implements UserServerInterface {
  constructor(
    @inject(TYPES.ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.Register) private registerUser: Register,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.SignInWithRecoveryCodes) private doSignInWithRecoveryCodes: SignInWithRecoveryCodes,
    @inject(TYPES.GetUserKeyParamsRecovery) private getUserKeyParamsRecovery: GetUserKeyParamsRecovery,
    @inject(TYPES.GenerateRecoveryCodes) private doGenerateRecoveryCodes: GenerateRecoveryCodes,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async deleteAccount(_params: never): Promise<HttpResponse<UserDeletionResponseBody>> {
    throw new Error('This method is implemented on the payments server.')
  }

  async register(params: UserRegistrationRequestParams): Promise<HttpResponse<UserRegistrationResponseBody>> {
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

  async generateRecoveryCodes(
    params: GenerateRecoveryCodesRequestParams,
  ): Promise<HttpResponse<GenerateRecoveryCodesResponseBody>> {
    const result = await this.doGenerateRecoveryCodes.execute({
      userUuid: params.userUuid,
    })

    if (result.isFailed()) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Could not generate recovery codes.',
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: {
        recoveryCodes: result.getValue(),
      },
    }
  }

  async signInWithRecoveryCodes(
    params: SignInWithRecoveryCodesRequestParams,
  ): Promise<HttpResponse<SignInWithRecoveryCodesResponseBody>> {
    if (params.apiVersion !== ApiVersion.v0) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Invalid API version.',
          },
        },
      }
    }

    const result = await this.doSignInWithRecoveryCodes.execute({
      userAgent: params.userAgent,
      username: params.username,
      password: params.password,
      codeVerifier: params.codeVerifier,
      recoveryCodes: params.recoveryCodes,
    })

    if (result.isFailed()) {
      this.logger.debug(`Failed to sign in with recovery codes: ${result.getError()}`)

      return {
        status: HttpStatusCode.Unauthorized,
        data: {
          error: {
            message: 'Invalid login credentials.',
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: result.getValue(),
    }
  }

  async recoveryKeyParams(
    params: RecoveryKeyParamsRequestParams,
  ): Promise<HttpResponse<RecoveryKeyParamsResponseBody>> {
    if (params.apiVersion !== ApiVersion.v0) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Invalid API version.',
          },
        },
      }
    }

    const result = await this.getUserKeyParamsRecovery.execute({
      username: params.username,
      codeChallenge: params.codeChallenge,
      recoveryCodes: params.recoveryCodes,
    })

    if (result.isFailed()) {
      this.logger.debug(`Failed to get recovery key params: ${result.getError()}`)

      return {
        status: HttpStatusCode.Unauthorized,
        data: {
          error: {
            message: 'Invalid login credentials.',
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: {
        keyParams: result.getValue(),
      },
    }
  }
}
