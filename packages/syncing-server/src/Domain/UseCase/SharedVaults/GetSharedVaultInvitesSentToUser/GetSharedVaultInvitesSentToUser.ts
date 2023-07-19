import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { GetSharedVaultInvitesSentToUserDTO } from './GetSharedVaultInvitesSentToUserDTO'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class GetSharedVaultInvitesSentToUser implements UseCaseInterface<SharedVaultInvite[]> {
  constructor(private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface) {}

  async execute(dto: GetSharedVaultInvitesSentToUserDTO): Promise<Result<SharedVaultInvite[]>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    if (dto.lastSyncTime) {
      return Result.ok(await this.sharedVaultInviteRepository.findByUserUuidUpdatedAfter(userUuid, dto.lastSyncTime))
    }

    return Result.ok(await this.sharedVaultInviteRepository.findByUserUuid(userUuid))
  }
}
