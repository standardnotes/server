import * as crypto from 'crypto'
import * as dayjs from 'dayjs'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AuthenticationMethodResolverInterface } from '../Auth/AuthenticationMethodResolverInterface'

import { AuthenticateUserDTO } from './AuthenticateUserDTO'
import { AuthenticateUserResponse } from './AuthenticateUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class AuthenticateUser implements UseCaseInterface {
  constructor(
    @inject(TYPES.AuthenticationMethodResolver)
    private authenticationMethodResolver: AuthenticationMethodResolverInterface,
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

        if (session.refreshExpiration < dayjs.utc().toDate()) {
          return {
            success: false,
            failureType: 'INVALID_AUTH',
          }
        }

        if (session.accessExpiration < dayjs.utc().toDate()) {
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
}
