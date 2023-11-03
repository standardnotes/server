import { TimerInterface } from '@standardnotes/time'
import * as crypto from 'crypto'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AuthenticationMethodResolverInterface } from '../Auth/AuthenticationMethodResolverInterface'
import { Session } from '../Session/Session'

import { AuthenticateUserDTO } from './AuthenticateUserDTO'
import { AuthenticateUserResponse } from './AuthenticateUserResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { Logger } from 'winston'

@injectable()
export class AuthenticateUser implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_AuthenticationMethodResolver)
    private authenticationMethodResolver: AuthenticationMethodResolverInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
    @inject(TYPES.Auth_ACCESS_TOKEN_AGE) private accessTokenAge: number,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async execute(dto: AuthenticateUserDTO): Promise<AuthenticateUserResponse> {
    const authenticationMethod = await this.authenticationMethodResolver.resolve(dto.token)
    if (!authenticationMethod) {
      this.logger.debug(`[authenticate-user] No authentication method found for token: ${dto.token}`)

      return {
        success: false,
        failureType: 'INVALID_AUTH',
      }
    }

    if (authenticationMethod.type === 'revoked') {
      this.logger.debug(`[authenticate-user] Session has been revoked: ${dto.token}`)

      return {
        success: false,
        failureType: 'REVOKED_SESSION',
      }
    }

    const user = authenticationMethod.user
    if (!user) {
      this.logger.debug(`[authenticate-user] No user found for authentication method. Token: ${dto.token}`)

      return {
        success: false,
        failureType: 'INVALID_AUTH',
      }
    }

    if (authenticationMethod.type == 'jwt' && user.supportsSessions()) {
      this.logger.debug(
        `[authenticate-user][${user.uuid}] User supports sessions but is trying to authenticate with a JWT.`,
      )

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
          this.logger.debug(`[authenticate-user][${user.uuid}] Password hash does not match.`)

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
          this.logger.debug(`[authenticate-user][${user.uuid}] No session found for authentication method.`)

          return {
            success: false,
            failureType: 'INVALID_AUTH',
          }
        }

        if (session.refreshExpiration < this.timer.getUTCDate()) {
          this.logger.debug(`[authenticate-user][${user.uuid}] Session refresh token has expired.`)

          return {
            success: false,
            failureType: 'INVALID_AUTH',
          }
        }

        if (this.sessionIsExpired(session)) {
          this.logger.debug(`[authenticate-user][${user.uuid}] Session access token has expired.`)

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
