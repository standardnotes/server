import { TokenEncoderInterface, CrossServiceTokenData } from '@standardnotes/security'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Role } from '../../Role/Role'
import { Session } from '../../Session/Session'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { CreateCrossServiceTokenDTO } from './CreateCrossServiceTokenDTO'
import { CreateCrossServiceTokenResponse } from './CreateCrossServiceTokenResponse'

@injectable()
export class CreateCrossServiceToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_UserProjector) private userProjector: ProjectorInterface<User>,
    @inject(TYPES.Auth_SessionProjector) private sessionProjector: ProjectorInterface<Session>,
    @inject(TYPES.Auth_RoleProjector) private roleProjector: ProjectorInterface<Role>,
    @inject(TYPES.Auth_CrossServiceTokenEncoder) private tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>,
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_AUTH_JWT_TTL) private jwtTTL: number,
  ) {}

  async execute(dto: CreateCrossServiceTokenDTO): Promise<CreateCrossServiceTokenResponse> {
    let user: User | undefined | null = dto.user
    if (user === undefined && dto.userUuid !== undefined) {
      user = await this.userRepository.findOneByUuid(dto.userUuid)
    }

    if (!user) {
      throw new Error(`Could not find user with uuid ${dto.userUuid}`)
    }

    const roles = await user.roles

    const authTokenData: CrossServiceTokenData = {
      user: this.projectUser(user),
      roles: this.projectRoles(roles),
    }

    if (dto.session !== undefined) {
      authTokenData.session = this.projectSession(dto.session)
    }

    return {
      token: this.tokenEncoder.encodeExpirableToken(authTokenData, this.jwtTTL),
    }
  }

  private projectUser(user: User): { uuid: string; email: string } {
    return <{ uuid: string; email: string }>this.userProjector.projectSimple(user)
  }

  private projectSession(session: Session): {
    uuid: string
    api_version: string
    created_at: string
    updated_at: string
    device_info: string
    readonly_access: boolean
    access_expiration: string
    refresh_expiration: string
  } {
    return <
      {
        uuid: string
        api_version: string
        created_at: string
        updated_at: string
        device_info: string
        readonly_access: boolean
        access_expiration: string
        refresh_expiration: string
      }
    >this.sessionProjector.projectSimple(session)
  }

  private projectRoles(roles: Array<Role>): Array<{ uuid: string; name: string }> {
    return roles.map((role) => <{ uuid: string; name: string }>this.roleProjector.projectSimple(role))
  }
}
