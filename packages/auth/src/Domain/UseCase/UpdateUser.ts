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
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_AuthResponseFactoryResolver)
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: UpdateUserDTO): Promise<UpdateUserResponse> {
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
