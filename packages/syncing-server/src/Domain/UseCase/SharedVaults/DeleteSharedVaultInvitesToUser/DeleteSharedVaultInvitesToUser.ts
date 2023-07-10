import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DeleteSharedVaultInvitesToUserDTO } from './DeleteSharedVaultInvitesToUserDTO'
import { DeclineInviteToSharedVault } from '../DeclineInviteToSharedVault/DeclineInviteToSharedVault'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class DeleteSharedVaultInvitesToUser implements UseCaseInterface<void> {
  constructor(
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private declineInviteToSharedVault: DeclineInviteToSharedVault,
  ) {}

  async execute(dto: DeleteSharedVaultInvitesToUserDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const inboundInvites = await this.sharedVaultInviteRepository.findByUserUuid(userUuid)
    for (const invite of inboundInvites) {
      const result = await this.declineInviteToSharedVault.execute({
        inviteUuid: invite.id.toString(),
        originatorUuid: userUuid.value,
      })
      if (result.isFailed()) {
        return Result.fail(result.getError())
      }
    }

    return Result.ok()
  }
}
