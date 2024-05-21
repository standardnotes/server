import { CrossServiceTokenData, TokenEncoderInterface } from '@standardnotes/security'
import { Result, RoleName, SettingName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Role } from '../../Role/Role'
import { Session } from '../../Session/Session'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { CreateCrossServiceTokenDTO } from './CreateCrossServiceTokenDTO'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetActiveSessionsForUser } from '../GetActiveSessionsForUser'

export class CreateCrossServiceToken implements UseCaseInterface<string> {
  constructor(
    private userProjector: ProjectorInterface<User>,
    private sessionProjector: ProjectorInterface<Session>,
    private roleProjector: ProjectorInterface<Role>,
    private tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>,
    private userRepository: UserRepositoryInterface,
    private jwtTTL: number,
    private getRegularSubscription: GetRegularSubscriptionForUser,
    private getSubscriptionSettingUseCase: GetSubscriptionSetting,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private getActiveSessions: GetActiveSessionsForUser,
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

    const roles = await user.roles
    const coreUserRole = roles.find((role) => role.name === RoleName.NAMES.CoreUser)
    let hasContentLimit = false

    if (coreUserRole) {
      const permissions = await coreUserRole.permissions
      hasContentLimit = permissions.find((permission) => permission.name === 'server:content-limit') !== undefined
    }

    const sharedVaultAssociations = await this.sharedVaultUserRepository.findByUserUuid(
      Uuid.create(user.uuid).getValue(),
    )

    const authTokenData: CrossServiceTokenData = {
      user: this.projectUser(user),
      roles: this.projectRoles(roles),
      shared_vault_owner_context: undefined,
      belongs_to_shared_vaults: sharedVaultAssociations.map((association) => ({
        shared_vault_uuid: association.props.sharedVaultUuid.value,
        permission: association.props.permission.value,
      })),
      hasContentLimit: hasContentLimit,
    }

    if (dto.sharedVaultOwnerContext !== undefined) {
      const regularSubscriptionOrError = await this.getRegularSubscription.execute({
        userUuid: dto.sharedVaultOwnerContext,
      })
      if (regularSubscriptionOrError.isFailed()) {
        return Result.fail(regularSubscriptionOrError.getError())
      }
      const regularSubscription = regularSubscriptionOrError.getValue()

      const uploadBytesLimitSettingOrError = await this.getSubscriptionSettingUseCase.execute({
        settingName: SettingName.NAMES.FileUploadBytesLimit,
        userSubscriptionUuid: regularSubscription.uuid,
        allowSensitiveRetrieval: false,
      })
      if (uploadBytesLimitSettingOrError.isFailed()) {
        return Result.fail(uploadBytesLimitSettingOrError.getError())
      }
      const uploadBytesLimitSetting = uploadBytesLimitSettingOrError.getValue()
      const uploadBytesLimit = parseInt(uploadBytesLimitSetting.setting.props.value as string)

      authTokenData.shared_vault_owner_context = {
        upload_bytes_limit: uploadBytesLimit,
      }
    }

    if (dto.session !== undefined) {
      authTokenData.session = this.projectSession(dto.session)
    } else if (dto.sessionUuid !== undefined) {
      const activeSessionsResponse = await this.getActiveSessions.execute({
        userUuid: user.uuid,
        sessionUuid: dto.sessionUuid,
      })
      if (activeSessionsResponse.sessions.length) {
        authTokenData.session = this.projectSession(activeSessionsResponse.sessions[0])
      }
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
