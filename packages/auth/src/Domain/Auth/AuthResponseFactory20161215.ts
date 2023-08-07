import { SessionTokenData, TokenEncoderInterface } from '@standardnotes/security'
import { ProtocolVersion } from '@standardnotes/common'
import * as crypto from 'crypto'

import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'

import { User } from '../User/User'
import { AuthResponse20161215 } from './AuthResponse20161215'
import { AuthResponse20200115 } from './AuthResponse20200115'
import { AuthResponseFactoryInterface } from './AuthResponseFactoryInterface'
import { Session } from '../Session/Session'

@injectable()
export class AuthResponseFactory20161215 implements AuthResponseFactoryInterface {
  constructor(
    @inject(TYPES.Auth_UserProjector) protected userProjector: ProjectorInterface<User>,
    @inject(TYPES.Auth_SessionTokenEncoder) protected tokenEncoder: TokenEncoderInterface<SessionTokenData>,
    @inject(TYPES.Auth_Logger) protected logger: Logger,
  ) {}

  async createResponse(dto: {
    user: User
    apiVersion: string
    userAgent: string
    ephemeralSession: boolean
    readonlyAccess: boolean
  }): Promise<{ response: AuthResponse20161215 | AuthResponse20200115; session?: Session }> {
    this.logger.debug(`Creating JWT auth response for user ${dto.user.uuid}`)

    const data: SessionTokenData = {
      user_uuid: dto.user.uuid,
      pw_hash: crypto.createHash('sha256').update(dto.user.encryptedPassword).digest('hex'),
    }

    const token = this.tokenEncoder.encodeToken(data)

    this.logger.debug(`Created JWT token for user ${dto.user.uuid}: ${token}`)

    return {
      response: {
        user: this.userProjector.projectSimple(dto.user) as {
          uuid: string
          email: string
          protocolVersion: ProtocolVersion
        },
        token,
      },
    }
  }
}
