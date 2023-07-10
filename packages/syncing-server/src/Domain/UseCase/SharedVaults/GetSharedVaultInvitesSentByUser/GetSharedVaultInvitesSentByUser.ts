import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { GetSharedVaultInvitesSentByUserDTO } from './GetSharedVaultInvitesSentByUserDTO'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class GetSharedVaultInvitesSentByUser implements UseCaseInterface<SharedVaultInvite[]> {
  constructor(private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface) {}

  async execute(dto: GetSharedVaultInvitesSentByUserDTO): Promise<Result<SharedVaultInvite[]>> {
    const senderUuidOrError = Uuid.create(dto.senderUuid)
    if (senderUuidOrError.isFailed()) {
      return Result.fail(senderUuidOrError.getError())
    }
    const senderUuid = senderUuidOrError.getValue()

    let sharedVaultUuid: Uuid | undefined
    if (dto.sharedVaultUuid) {
      const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        return Result.fail(sharedVaultUuidOrError.getError())
      }
      sharedVaultUuid = sharedVaultUuidOrError.getValue()
    }

    if (sharedVaultUuid) {
      return Result.ok(
        await this.sharedVaultInviteRepository.findBySenderUuidAndSharedVaultUuid({
          senderUuid,
          sharedVaultUuid,
        }),
      )
    }

    return Result.ok(await this.sharedVaultInviteRepository.findBySenderUuid(senderUuid))
  }
}
