import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DeleteSharedVaultInvitesSentByUserDTO } from './DeleteSharedVaultInvitesSentByUserDTO'
import { DeclineInviteToSharedVault } from '../DeclineInviteToSharedVault/DeclineInviteToSharedVault'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class DeleteSharedVaultInvitesSentByUser implements UseCaseInterface<void> {
  constructor(
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private declineInviteToSharedVault: DeclineInviteToSharedVault,
  ) {}

  async execute(dto: DeleteSharedVaultInvitesSentByUserDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const inboundInvites = await this.sharedVaultInviteRepository.findBySenderUuidAndSharedVaultUuid({
      senderUuid: userUuid,
      sharedVaultUuid,
    })
    for (const invite of inboundInvites) {
      const result = await this.declineInviteToSharedVault.execute({
        inviteUuid: invite.id.toString(),
        userUuid: userUuid.value,
      })
      if (result.isFailed()) {
        return Result.fail(result.getError())
      }
    }

    return Result.ok()
  }
}
