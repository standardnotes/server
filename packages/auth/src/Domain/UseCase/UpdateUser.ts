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
    const { user, apiVersion, ...updateFields } = dto

    Object.keys(updateFields).forEach(
      (key) => (updateFields[key] === undefined || updateFields[key] === null) && delete updateFields[key],
    )

    Object.assign(user, updateFields)

    user.updatedAt = this.timer.getUTCDate()

    await this.userRepository.save(user)

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(apiVersion)

    return {
      success: true,
      authResponse: await authResponseFactory.createResponse({
        user,
        apiVersion,
        userAgent: dto.updatedWithUserAgent,
        ephemeralSession: false,
        readonlyAccess: false,
      }),
    }
  }
}
