import { TimerInterface } from '@standardnotes/time'
import * as crypto from 'crypto'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AuthenticationMethodResolverInterface } from '../Auth/AuthenticationMethodResolverInterface'
import { Session } from '../Session/Session'

import { AuthenticateUserDTO } from './AuthenticateUserDTO'
import { AuthenticateUserResponse } from './AuthenticateUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class AuthenticateUser implements UseCaseInterface {
  constructor(
    @inject(TYPES.AuthenticationMethodResolver)
    private authenticationMethodResolver: AuthenticationMethodResolverInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.ACCESS_TOKEN_AGE) private accessTokenAge: number,
  ) {}

  async execute(dto: AuthenticateUserDTO): Promise<AuthenticateUserResponse> {
    const authenticationMethod = await this.authenticationMethodResolver.resolve(dto.token)
    if (!authenticationMethod) {
      return {
        success: false,
        failureType: 'INVALID_AUTH',
      }
    }

    if (authenticationMethod.type === 'revoked') {
      return {
        success: false,
        failureType: 'REVOKED_SESSION',
      }
    }

    const user = authenticationMethod.user
    if (!user) {
      return {
        success: false,
        failureType: 'INVALID_AUTH',
      }
    }

    if (authenticationMethod.type == 'jwt' && user.supportsSessions()) {
      return {
        success: false,
        failureType: 'INVALID_AUTH',
      }
    }

    switch (authenticationMethod.type) {
      case 'jwt': {
        const pwHash = <string>(<Record<string, unknown>>authenticationMethod.claims).pw_hash
        const encryptedPasswordDigest = crypto.createHash('sha256').update(user.encryptedPassword).digest('hex')

        if (!pwHash || !crypto.timingSafeEqual(Buffer.from(pwHash), Buffer.from(encryptedPasswordDigest))) {
          return {
            success: false,
            failureType: 'INVALID_AUTH',
          }
        }
        break
      }
      case 'session_token': {
        const session = authenticationMethod.session
        if (!session) {
          return {
            success: false,
            failureType: 'INVALID_AUTH',
          }
        }

        if (session.refreshExpiration < this.timer.getUTCDate()) {
          return {
            success: false,
            failureType: 'INVALID_AUTH',
          }
        }

        if (this.sessionIsExpired(session)) {
          return {
            success: false,
            failureType: 'EXPIRED_TOKEN',
          }
        }

        break
      }
    }

    return {
      success: true,
      user,
      session: authenticationMethod.session,
    }
  }

  private sessionIsExpired(session: Session): boolean {
    const sessionIsExpired = session.accessExpiration < this.timer.getUTCDate()

    const freshlyCreatedSessionSafetyBufferSeconds = 10
    const currentConfigurationAccessTokenExpiration = this.timer.getUTCDateNSecondsAhead(
      this.accessTokenAge + freshlyCreatedSessionSafetyBufferSeconds,
    )

    const sessionIsLongerThanCurrentConfiguration = session.accessExpiration > currentConfigurationAccessTokenExpiration

    return sessionIsExpired || sessionIsLongerThanCurrentConfiguration
  }
}
