import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SharedVaultInvite } from '../../SharedVault/User/Invite/SharedVaultInvite'
import { GetSharedVaultInvitesSentByUserDTO } from './GetSharedVaultInvitesSentByUserDTO'
import { SharedVaultInviteRepositoryInterface } from '../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class GetSharedVaultInvitesSentByUser implements UseCaseInterface<SharedVaultInvite[]> {
  constructor(private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface) {}

  async execute(dto: GetSharedVaultInvitesSentByUserDTO): Promise<Result<SharedVaultInvite[]>> {
    const senderUuidOrError = Uuid.create(dto.senderUuid)
    if (senderUuidOrError.isFailed()) {
      return Result.fail(senderUuidOrError.getError())
    }
    const senderUuid = senderUuidOrError.getValue()

    const invites = await this.sharedVaultInviteRepository.findBySenderUuid(senderUuid)

    return Result.ok(invites)
  }
}
