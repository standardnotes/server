import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DeleteSharedVaultInvitesSentByUserDTO } from './DeleteSharedVaultInvitesSentByUserDTO'
import { CancelInviteToSharedVault } from '../CancelInviteToSharedVault/CancelInviteToSharedVault'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class DeleteSharedVaultInvitesSentByUser implements UseCaseInterface<void> {
  constructor(
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private cancelInviteToSharedVault: CancelInviteToSharedVault,
  ) {}

  async execute(dto: DeleteSharedVaultInvitesSentByUserDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    let inboundInvites = []
    if (dto.sharedVaultUuid !== undefined) {
      const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        return Result.fail(sharedVaultUuidOrError.getError())
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      inboundInvites = await this.sharedVaultInviteRepository.findBySenderUuidAndSharedVaultUuid({
        senderUuid: userUuid,
        sharedVaultUuid,
      })
    } else {
      inboundInvites = await this.sharedVaultInviteRepository.findBySenderUuid(userUuid)
    }

    for (const invite of inboundInvites) {
      const result = await this.cancelInviteToSharedVault.execute({
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
