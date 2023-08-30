import { TokenEncoderInterface, CrossServiceTokenData } from '@standardnotes/security'
import { inject, injectable } from 'inversify'
import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import TYPES from '../../../Bootstrap/Types'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Role } from '../../Role/Role'
import { Session } from '../../Session/Session'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { CreateCrossServiceTokenDTO } from './CreateCrossServiceTokenDTO'
import { GetSetting } from '../GetSetting/GetSetting'
import { SettingName } from '@standardnotes/settings'
import { TransitionStatusRepositoryInterface } from '../../Transition/TransitionStatusRepositoryInterface'

@injectable()
export class CreateCrossServiceToken implements UseCaseInterface<string> {
  constructor(
    @inject(TYPES.Auth_UserProjector) private userProjector: ProjectorInterface<User>,
    @inject(TYPES.Auth_SessionProjector) private sessionProjector: ProjectorInterface<Session>,
    @inject(TYPES.Auth_RoleProjector) private roleProjector: ProjectorInterface<Role>,
    @inject(TYPES.Auth_CrossServiceTokenEncoder) private tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>,
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_AUTH_JWT_TTL) private jwtTTL: number,
    @inject(TYPES.Auth_GetSetting)
    private getSettingUseCase: GetSetting,
    @inject(TYPES.Auth_TransitionStatusRepository)
    private transitionStatusRepository: TransitionStatusRepositoryInterface,
  ) {}

  async execute(dto: CreateCrossServiceTokenDTO): Promise<Result<string>> {
    let user: User | undefined | null = dto.user
    if (user === undefined && dto.userUuid !== undefined) {
      const userUuidOrError = Uuid.create(dto.userUuid)
      if (userUuidOrError.isFailed()) {
        return Result.fail(userUuidOrError.getError())
      }
      const userUuid = userUuidOrError.getValue()

      user = await this.userRepository.findOneByUuid(userUuid)
    }

    if (!user) {
      return Result.fail(`Could not find user with uuid ${dto.userUuid}`)
    }

    const transitionStatus = await this.transitionStatusRepository.getStatus(user.uuid, 'items')

    const roles = await user.roles

    const authTokenData: CrossServiceTokenData = {
      user: this.projectUser(user),
      roles: this.projectRoles(roles),
      shared_vault_owner_context: undefined,
      ongoing_transition: transitionStatus === 'STARTED',
    }

    if (dto.sharedVaultOwnerContext !== undefined) {
      const uploadBytesLimitSettingOrError = await this.getSettingUseCase.execute({
        settingName: SettingName.NAMES.FileUploadBytesLimit,
        userUuid: dto.sharedVaultOwnerContext,
      })
      if (uploadBytesLimitSettingOrError.isFailed()) {
        return Result.fail(uploadBytesLimitSettingOrError.getError())
      }
      const uploadBytesLimitSetting = uploadBytesLimitSettingOrError.getValue()
      if (uploadBytesLimitSetting.sensitive) {
        return Result.fail('Shared vault owner upload bytes limit setting is sensitive!')
      }
      const uploadBytesLimit = parseInt(uploadBytesLimitSetting.setting.value as string)

      authTokenData.shared_vault_owner_context = {
        upload_bytes_limit: uploadBytesLimit,
      }
    }

    if (dto.session !== undefined) {
      authTokenData.session = this.projectSession(dto.session)
    }

    return Result.ok(this.tokenEncoder.encodeExpirableToken(authTokenData, this.jwtTTL))
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
