import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DeclineInviteToSharedVaultDTO } from './DeclineInviteToSharedVaultDTO'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class DeclineInviteToSharedVault implements UseCaseInterface<void> {
  constructor(private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface) {}

  async execute(dto: DeclineInviteToSharedVaultDTO): Promise<Result<void>> {
    const inviteUuidOrError = Uuid.create(dto.inviteUuid)
    if (inviteUuidOrError.isFailed()) {
      return Result.fail(inviteUuidOrError.getError())
    }
    const inviteUuid = inviteUuidOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const invite = await this.sharedVaultInviteRepository.findByUuid(inviteUuid)
    if (!invite) {
      return Result.fail('Invite not found')
    }

    if (!invite.props.userUuid.equals(userUuid) && !invite.props.senderUuid.equals(userUuid)) {
      return Result.fail('Only the recipient or the sender can decline the invite')
    }

    await this.sharedVaultInviteRepository.remove(invite)

    return Result.ok()
  }
}
