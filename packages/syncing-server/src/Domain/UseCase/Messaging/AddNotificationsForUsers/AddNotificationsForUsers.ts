import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { AddNotificationsForUsersDTO } from './AddNotificationsForUsersDTO'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { AddNotificationForUser } from '../AddNotificationForUser/AddNotificationForUser'

export class AddNotificationsForUsers implements UseCaseInterface<void> {
  constructor(
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private addNotificationForUser: AddNotificationForUser,
  ) {}

  async execute(dto: AddNotificationsForUsersDTO): Promise<Result<void>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    let exceptUserUuid: Uuid | undefined
    if (dto.exceptUserUuid) {
      const exceptUserUuidOrError = Uuid.create(dto.exceptUserUuid)
      if (exceptUserUuidOrError.isFailed()) {
        return Result.fail(exceptUserUuidOrError.getError())
      }
      exceptUserUuid = exceptUserUuidOrError.getValue()
    }

    const sharedVaultUsers = await this.sharedVaultUserRepository.findBySharedVaultUuid(sharedVaultUuid)
    for (const sharedVaultUser of sharedVaultUsers) {
      if (exceptUserUuid && sharedVaultUser.props.userUuid.equals(exceptUserUuid)) {
        continue
      }

      const result = await this.addNotificationForUser.execute({
        userUuid: sharedVaultUser.props.userUuid.value,
        type: dto.type,
        payload: dto.payload,
        version: dto.version,
      })
      if (result.isFailed()) {
        return Result.fail(result.getError())
      }
    }

    return Result.ok()
  }
}
