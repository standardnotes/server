import * as bcrypt from 'bcryptjs'
import { RoleName, Username } from '@standardnotes/domain-core'
import { v4 as uuidv4 } from 'uuid'
import { TimerInterface } from '@standardnotes/time'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { RegisterDTO } from './RegisterDTO'
import { RegisterResponse } from './RegisterResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { RoleRepositoryInterface } from '../Role/RoleRepositoryInterface'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { AuthResponseFactory20200115 } from '../Auth/AuthResponseFactory20200115'
import { AuthResponse20200115 } from '../Auth/AuthResponse20200115'
import { ApiVersion } from '../Api/ApiVersion'
import { ApplyDefaultSettings } from './ApplyDefaultSettings/ApplyDefaultSettings'

export class Register implements UseCaseInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private roleRepository: RoleRepositoryInterface,
    private authResponseFactory20200115: AuthResponseFactory20200115,
    private crypter: CrypterInterface,
    private disableUserRegistration: boolean,
    private timer: TimerInterface,
    private applyDefaultSettings: ApplyDefaultSettings,
  ) {}

  async execute(dto: RegisterDTO): Promise<RegisterResponse> {
    if (this.disableUserRegistration) {
      return {
        success: false,
        errorMessage: 'User registration is currently not allowed.',
      }
    }

    const { email, password, apiVersion, ephemeralSession, ...registrationFields } = dto

    if (![ApiVersion.v20200115, ApiVersion.v20240226].includes(apiVersion as ApiVersion)) {
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
    user.roles = Promise.resolve(roles)

    Object.assign(user, registrationFields)

    user = await this.userRepository.save(user)

    const settingsApplicationResult = await this.applyDefaultSettings.execute({
      userName: user.email,
      userUuid: user.uuid,
    })
    if (settingsApplicationResult.isFailed()) {
      return {
        success: false,
        errorMessage: settingsApplicationResult.getError(),
      }
    }

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
