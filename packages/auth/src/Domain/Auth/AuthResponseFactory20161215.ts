import { SessionTokenData, TokenEncoderInterface } from '@standardnotes/security'
import { ProtocolVersion, Uuid } from '@standardnotes/common'
import * as crypto from 'crypto'

import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'

import { User } from '../User/User'
import { AuthResponse20161215 } from './AuthResponse20161215'
import { AuthResponse20200115 } from './AuthResponse20200115'
import { AuthResponseFactoryInterface } from './AuthResponseFactoryInterface'

@injectable()
export class AuthResponseFactory20161215 implements AuthResponseFactoryInterface {
  constructor(
    @inject(TYPES.UserProjector) protected userProjector: ProjectorInterface<User>,
    @inject(TYPES.SessionTokenEncoder) protected tokenEncoder: TokenEncoderInterface<SessionTokenData>,
    @inject(TYPES.Logger) protected logger: Logger,
  ) {}

  async createResponse(dto: {
    user: User
    apiVersion: string
    userAgent: string
    ephemeralSession: boolean
    readonlyAccess: boolean
  }): Promise<AuthResponse20161215 | AuthResponse20200115> {
    this.logger.debug(`Creating JWT auth response for user ${dto.user.uuid}`)

    const data: SessionTokenData = {
      user_uuid: dto.user.uuid,
      pw_hash: crypto.createHash('sha256').update(dto.user.encryptedPassword).digest('hex'),
    }

    const token = this.tokenEncoder.encodeToken(data)

    this.logger.debug(`Created JWT token for user ${dto.user.uuid}: ${token}`)

    return {
      user: this.userProjector.projectSimple(dto.user) as {
        uuid: Uuid
        email: string
        protocolVersion: ProtocolVersion
      },
      token,
    }
  }
}
