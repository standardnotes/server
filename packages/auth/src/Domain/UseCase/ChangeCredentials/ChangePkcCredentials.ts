import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { AuthResponseFactoryResolverInterface } from '../../Auth/AuthResponseFactoryResolverInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { ChangeCredentialsResponse } from './ChangeCredentialsResponse'
import { UseCaseInterface } from '../UseCaseInterface'
import { TimerInterface } from '@standardnotes/time'
import { User } from '../../User/User'

@injectable()
export class ChangePkcCredentials implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.AuthResponseFactoryResolver)
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: {
    user: User
    publicKey: string
    encryptedPrivateKey: string
    apiVersion: string
    updatedWithUserAgent: string
  }): Promise<ChangeCredentialsResponse> {
    dto.user.publicKey = dto.publicKey
    dto.user.encryptedPrivateKey = dto.encryptedPrivateKey
    dto.user.updatedAt = this.timer.getUTCDate()

    const updatedUser = await this.userRepository.save(dto.user)

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(dto.apiVersion)

    return {
      success: true,
      authResponse: await authResponseFactory.createResponse({
        user: updatedUser,
        apiVersion: dto.apiVersion,
        userAgent: dto.updatedWithUserAgent,
        ephemeralSession: false,
        readonlyAccess: false,
      }),
    }
  }
}
