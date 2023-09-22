import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { RemoveUserFromSharedVault } from '../RemoveUserFromSharedVault/RemoveUserFromSharedVault'
import { Logger } from 'winston'
import { RemoveUserFromSharedVaultsDTO } from './RemoveUserFromSharedVaultsDTO'

export class RemoveUserFromSharedVaults implements UseCaseInterface<void> {
  constructor(
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private removeUserFromSharedVault: RemoveUserFromSharedVault,
    private logger: Logger,
  ) {}

  async execute(dto: RemoveUserFromSharedVaultsDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const sharedVaultUsers = await this.sharedVaultUserRepository.findByUserUuid(userUuid)
    for (const sharedVaultUser of sharedVaultUsers) {
      const result = await this.removeUserFromSharedVault.execute({
        sharedVaultUuid: sharedVaultUser.props.sharedVaultUuid.value,
        originatorUuid: userUuid.value,
        userUuid: userUuid.value,
        forceRemoveOwner: true,
      })

      if (result.isFailed()) {
        this.logger.error(
          `Failed to remove user: ${userUuid.value} from shared vault: ${
            sharedVaultUser.props.sharedVaultUuid.value
          }: ${result.getError()}`,
        )
      }
    }

    return Result.ok()
  }
}
