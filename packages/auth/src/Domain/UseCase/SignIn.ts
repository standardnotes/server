import * as bcrypt from 'bcryptjs'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { PermissionName } from '@standardnotes/features'
import { MuteSignInEmailsOption, SettingName } from '@standardnotes/settings'

import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { Setting } from '../Setting/Setting'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SignInDTO } from './SignInDTO'
import { SignInResponse } from './SignInResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { PKCERepositoryInterface } from '../User/PKCERepositoryInterface'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { SignInDTOV2Challenged } from './SignInDTOV2Challenged'

@injectable()
export class SignIn implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.AuthResponseFactoryResolver)
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterface,
    @inject(TYPES.RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.PKCERepository) private pkceRepository: PKCERepositoryInterface,
    @inject(TYPES.Crypter) private crypter: CrypterInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: SignInDTO): Promise<SignInResponse> {
    if (this.isCodeChallengedVersion(dto)) {
      const validCodeVerifier = await this.validateCodeVerifier(dto.codeVerifier)
      if (!validCodeVerifier) {
        this.logger.debug('Code verifier does not match')

        return {
          success: false,
          errorMessage: 'Invalid email or password',
        }
      }
    }

    const user = await this.userRepository.findOneByEmail(dto.email)

    if (!user) {
      this.logger.debug(`User with email ${dto.email} was not found`)

      return {
        success: false,
        errorMessage: 'Invalid email or password',
      }
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.encryptedPassword)
    if (!passwordMatches) {
      this.logger.debug('Password does not match')

      return {
        success: false,
        errorMessage: 'Invalid email or password',
      }
    }

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(dto.apiVersion)

    await this.sendSignInEmailNotification(user, dto.userAgent)

    return {
      success: true,
      authResponse: await authResponseFactory.createResponse({
        user,
        apiVersion: dto.apiVersion,
        userAgent: dto.userAgent,
        ephemeralSession: dto.ephemeralSession,
        readonlyAccess: false,
      }),
    }
  }

  private async validateCodeVerifier(codeVerifier: string): Promise<boolean> {
    const codeChallenge = this.crypter.base64URLEncode(this.crypter.sha256Hash(codeVerifier))

    const matchingCodeChallengeWasPresentAndRemoved = await this.pkceRepository.removeCodeChallenge(codeChallenge)

    return matchingCodeChallengeWasPresentAndRemoved
  }

  private async sendSignInEmailNotification(user: User, userAgent: string): Promise<void> {
    try {
      const muteSignInEmailsSetting = await this.findOrCreateMuteSignInEmailsSetting(user)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createUserSignedInEvent({
          userUuid: user.uuid,
          userEmail: user.email,
          device: this.sessionService.getOperatingSystemInfoFromUserAgent(userAgent),
          browser: this.sessionService.getBrowserInfoFromUserAgent(userAgent),
          signInAlertEnabled:
            (await this.roleService.userHasPermission(user.uuid, PermissionName.SignInAlerts)) &&
            muteSignInEmailsSetting.value === MuteSignInEmailsOption.NotMuted,
          muteSignInEmailsSettingUuid: muteSignInEmailsSetting.uuid,
        }),
      )
    } catch (error) {
      this.logger.error(`Could not publish sign in event: ${(error as Error).message}`)
    }
  }

  private async findOrCreateMuteSignInEmailsSetting(user: User): Promise<Setting> {
    const existingMuteSignInEmailsSetting = await this.settingService.findSettingWithDecryptedValue({
      userUuid: user.uuid,
      settingName: SettingName.MuteSignInEmails,
    })

    if (existingMuteSignInEmailsSetting !== null) {
      return existingMuteSignInEmailsSetting
    }

    const createSettingResult = await this.settingService.createOrReplace({
      user,
      props: {
        name: SettingName.MuteSignInEmails,
        sensitive: false,
        unencryptedValue: MuteSignInEmailsOption.NotMuted,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
      },
    })

    return createSettingResult.setting
  }

  private isCodeChallengedVersion(dto: SignInDTO): dto is SignInDTOV2Challenged {
    return (dto as SignInDTOV2Challenged).codeVerifier !== undefined
  }
}
