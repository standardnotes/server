import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { DeleteSharedVaultsDTO } from './DeleteSharedVaultsDTO'
import { DeleteSharedVault } from '../DeleteSharedVault/DeleteSharedVault'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'

export class DeleteSharedVaults implements UseCaseInterface<Map<Uuid, 'deleted' | 'transitioned'>> {
  constructor(
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private deleteSharedVaultUseCase: DeleteSharedVault,
  ) {}

  async execute(dto: DeleteSharedVaultsDTO): Promise<Result<Map<Uuid, 'deleted' | 'transitioned'>>> {
    const ownerUuidOrError = Uuid.create(dto.ownerUuid)
    if (ownerUuidOrError.isFailed()) {
      return Result.fail(ownerUuidOrError.getError())
    }
    const ownerUuid = ownerUuidOrError.getValue()

    const sharedVaults = await this.sharedVaultRepository.findByUserUuid(ownerUuid)

    const results = new Map<Uuid, 'deleted' | 'transitioned'>()
    for (const sharedVault of sharedVaults) {
      const result = await this.deleteSharedVaultUseCase.execute({
        originatorUuid: ownerUuid.value,
        sharedVaultUuid: sharedVault.id.toString(),
        allowSurviving: dto.allowSurviving,
      })
      if (result.isFailed()) {
        return Result.fail(result.getError())
      }

      results.set(sharedVault.uuid, result.getValue().status)
    }

    return Result.ok(results)
  }
}
