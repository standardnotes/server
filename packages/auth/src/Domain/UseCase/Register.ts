import * as bcrypt from 'bcryptjs'
import { RoleName, Username } from '@standardnotes/domain-core'
import { v4 as uuidv4 } from 'uuid'
import { inject, injectable } from 'inversify'
import { TimerInterface } from '@standardnotes/time'

import TYPES from '../../Bootstrap/Types'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { RegisterDTO } from './RegisterDTO'
import { RegisterResponse } from './RegisterResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { RoleRepositoryInterface } from '../Role/RoleRepositoryInterface'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { AuthResponseFactory20200115 } from '../Auth/AuthResponseFactory20200115'
import { AuthResponse20200115 } from '../Auth/AuthResponse20200115'
import { ApiVersion } from '../Api/ApiVersion'

@injectable()
export class Register implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_RoleRepository) private roleRepository: RoleRepositoryInterface,
    @inject(TYPES.Auth_AuthResponseFactory20200115) private authResponseFactory20200115: AuthResponseFactory20200115,
    @inject(TYPES.Auth_Crypter) private crypter: CrypterInterface,
    @inject(TYPES.Auth_DISABLE_USER_REGISTRATION) private disableUserRegistration: boolean,
    @inject(TYPES.Auth_SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
    @inject(TYPES.Auth_TRANSITION_MODE_ENABLED) private transitionModeEnabled: boolean,
  ) {}

  async execute(dto: RegisterDTO): Promise<RegisterResponse> {
    if (this.disableUserRegistration) {
      return {
        success: false,
        errorMessage: 'User registration is currently not allowed.',
      }
    }

    const { email, password, apiVersion, ephemeralSession, ...registrationFields } = dto

    if (apiVersion !== ApiVersion.v20200115) {
      return {
        success: false,
        errorMessage: `Unsupported api version: ${apiVersion}`,
      }
    }

    const usernameOrError = Username.create(email)
    if (usernameOrError.isFailed()) {
      return {
        success: false,
        errorMessage: usernameOrError.getError(),
      }
    }
    const username = usernameOrError.getValue()

    const existingUser = await this.userRepository.findOneByUsernameOrEmail(username)
    if (existingUser) {
      return {
        success: false,
        errorMessage: 'This email is already registered.',
      }
    }

    let user = new User()
    user.uuid = uuidv4()
    user.email = username.value
    user.createdAt = this.timer.getUTCDate()
    user.updatedAt = this.timer.getUTCDate()
    user.encryptedPassword = await bcrypt.hash(password, User.PASSWORD_HASH_COST)
    user.encryptedServerKey = await this.crypter.generateEncryptedUserServerKey()
    user.serverEncryptionVersion = User.DEFAULT_ENCRYPTION_VERSION

    const roles = []
    const defaultRole = await this.roleRepository.findOneByName(RoleName.NAMES.CoreUser)
    if (defaultRole) {
      roles.push(defaultRole)
    }
    if (this.transitionModeEnabled) {
      const transitionRole = await this.roleRepository.findOneByName(RoleName.NAMES.TransitionUser)
      if (transitionRole) {
        roles.push(transitionRole)
      }
    }
    user.roles = Promise.resolve(roles)

    Object.assign(user, registrationFields)

    user = await this.userRepository.save(user)

    await this.settingService.applyDefaultSettingsUponRegistration(user)

    const result = await this.authResponseFactory20200115.createResponse({
      user,
      apiVersion,
      userAgent: dto.updatedWithUserAgent,
      ephemeralSession,
      readonlyAccess: false,
    })

    return {
      success: true,
      authResponse: result.response as AuthResponse20200115,
    }
  }
}
