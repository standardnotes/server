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

    const originatorUuidOrError = Uuid.create(dto.originatorUuid)
    if (originatorUuidOrError.isFailed()) {
      return Result.fail(originatorUuidOrError.getError())
    }
    const originatorUuid = originatorUuidOrError.getValue()

    const invite = await this.sharedVaultInviteRepository.findByUuid(inviteUuid)
    if (!invite) {
      return Result.fail('Invite not found')
    }

    if (!invite.props.userUuid.equals(originatorUuid)) {
      return Result.fail('Only the recipient of the invite can decline it')
    }

    await this.sharedVaultInviteRepository.remove(invite)

    return Result.ok()
  }
}
