import * as bcrypt from 'bcryptjs'
import { Uuid, Result, UseCaseInterface } from '@standardnotes/domain-core'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { VerifyUserServerPasswordDTO } from './VerifyUserServerPasswordDTO'
import { User } from '../../User/User'

export class VerifyUserServerPassword implements UseCaseInterface<void> {
  constructor(private userRepository: UserRepositoryInterface) {}
  async execute(dto: VerifyUserServerPasswordDTO): Promise<Result<void>> {
    // Only verify server password if the cross-service token version is 2 or higher
    if (!dto.authTokenVersion || dto.authTokenVersion < 2) {
      return Result.ok()
    }

    if (!dto.serverPassword) {
      return Result.fail('Please update your application to the latest version.')
    }

    let user: User | undefined | null = dto.user

    if (!user) {
      const userUuidOrError = Uuid.create(dto.userUuid as string)
      if (userUuidOrError.isFailed()) {
        return Result.fail(userUuidOrError.getError())
      }
      const userUuid = userUuidOrError.getValue()
      user = await this.userRepository.findOneByUuid(userUuid)

      if (!user) {
        return Result.fail('User not found.')
      }
    }

    const passwordMatch = await bcrypt.compare(dto.serverPassword, user.encryptedPassword)

    if (!passwordMatch) {
      return Result.fail('The password you entered is incorrect. Please try again.')
    }

    return Result.ok()
  }
}
