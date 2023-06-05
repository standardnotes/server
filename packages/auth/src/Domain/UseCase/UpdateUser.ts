import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UpdateUserDTO } from './UpdateUserDTO'
import { UpdateUserResponse } from './UpdateUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class UpdateUser implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.AuthResponseFactoryResolver)
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: UpdateUserDTO): Promise<UpdateUserResponse> {
    if (dto.user.publicKey || dto.user.encryptedPrivateKey) {
      return {
        success: false,
        errorMessage:
          'The keypair of a user with an existing keypair cannot be updated using this method. Instead, initiate a credentials change.',
      }
    }

    dto.user.publicKey = dto.publicKey
    dto.user.encryptedPrivateKey = dto.encryptedPrivateKey
    dto.user.signingPublicKey = dto.signingPublicKey
    dto.user.encryptedSigningPrivateKey = dto.encryptedSigningPrivateKey
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
