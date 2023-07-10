import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { AcceptInviteToSharedVaultDTO } from './AcceptInviteToSharedVaultDTO'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { AddUserToSharedVault } from '../AddUserToSharedVault/AddUserToSharedVault'

export class AcceptInviteToSharedVault implements UseCaseInterface<void> {
  constructor(
    private addUserToSharedVault: AddUserToSharedVault,
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
  ) {}

  async execute(dto: AcceptInviteToSharedVaultDTO): Promise<Result<void>> {
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
      return Result.fail('Only the recipient of the invite can accept it')
    }

    const result = await this.addUserToSharedVault.execute({
      sharedVaultUuid: invite.props.sharedVaultUuid.value,
      userUuid: invite.props.userUuid.value,
      permission: invite.props.permission.value,
    })
    if (result.isFailed()) {
      return Result.fail(result.getError())
    }

    await this.sharedVaultInviteRepository.remove(invite)

    return Result.ok()
  }
}
