import * as bcrypt from 'bcryptjs'
import { RoleName } from '@standardnotes/domain-core'
import { ApiVersion } from '@standardnotes/api'

import { v4 as uuidv4 } from 'uuid'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { RegisterDTO } from './RegisterDTO'
import { RegisterResponse } from './RegisterResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { RoleRepositoryInterface } from '../Role/RoleRepositoryInterface'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { TimerInterface } from '@standardnotes/time'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { AuthResponseFactory20200115 } from '../Auth/AuthResponseFactory20200115'
import { AuthResponse20200115 } from '../Auth/AuthResponse20200115'

@injectable()
export class Register implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.RoleRepository) private roleRepository: RoleRepositoryInterface,
    @inject(TYPES.AuthResponseFactory20200115) private authResponseFactory20200115: AuthResponseFactory20200115,
    @inject(TYPES.Crypter) private crypter: CrypterInterface,
    @inject(TYPES.DISABLE_USER_REGISTRATION) private disableUserRegistration: boolean,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: RegisterDTO): Promise<RegisterResponse> {
    if (this.disableUserRegistration) {
      return {
        success: false,
        errorMessage: 'User registration is currently not allowed.',
      }
    }

    const { email, password, apiVersion, ephemeralSession, ...registrationFields } = dto

    if (apiVersion !== ApiVersion.v0) {
      return {
        success: false,
        errorMessage: `Unsupported api version: ${apiVersion}`,
      }
    }

    const existingUser = await this.userRepository.findOneByEmail(email)
    if (existingUser) {
      return {
        success: false,
        errorMessage: 'This email is already registered.',
      }
    }

    let user = new User()
    user.uuid = uuidv4()
    user.email = email
    user.createdAt = this.timer.getUTCDate()
    user.updatedAt = this.timer.getUTCDate()
    user.encryptedPassword = await bcrypt.hash(password, User.PASSWORD_HASH_COST)
    user.encryptedServerKey = await this.crypter.generateEncryptedUserServerKey()
    user.serverEncryptionVersion = User.DEFAULT_ENCRYPTION_VERSION

    const defaultRole = await this.roleRepository.findOneByName(RoleName.NAMES.CoreUser)
    if (defaultRole) {
      user.roles = Promise.resolve([defaultRole])
    }

    Object.assign(user, registrationFields)

    user = await this.userRepository.save(user)

    await this.settingService.applyDefaultSettingsUponRegistration(user)

    return {
      success: true,
      authResponse: (await this.authResponseFactory20200115.createResponse({
        user,
        apiVersion,
        userAgent: dto.updatedWithUserAgent,
        ephemeralSession,
        readonlyAccess: false,
      })) as AuthResponse20200115,
    }
  }
}
