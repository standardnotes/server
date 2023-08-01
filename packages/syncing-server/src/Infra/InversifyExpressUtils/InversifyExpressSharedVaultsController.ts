import { controller, httpDelete, httpGet, httpPost, results } from 'inversify-express-utils'
import { inject } from 'inversify'
import { MapperInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'

import { BaseSharedVaultsController } from './Base/BaseSharedVaultsController'
import TYPES from '../../Bootstrap/Types'
import { SharedVault } from '../../Domain/SharedVault/SharedVault'
import { SharedVaultUser } from '../../Domain/SharedVault/User/SharedVaultUser'
import { CreateSharedVault } from '../../Domain/UseCase/SharedVaults/CreateSharedVault/CreateSharedVault'
import { CreateSharedVaultFileValetToken } from '../../Domain/UseCase/SharedVaults/CreateSharedVaultFileValetToken/CreateSharedVaultFileValetToken'
import { DeleteSharedVault } from '../../Domain/UseCase/SharedVaults/DeleteSharedVault/DeleteSharedVault'
import { GetSharedVaults } from '../../Domain/UseCase/SharedVaults/GetSharedVaults/GetSharedVaults'
import { SharedVaultHttpRepresentation } from '../../Mapping/Http/SharedVaultHttpRepresentation'
import { SharedVaultUserHttpRepresentation } from '../../Mapping/Http/SharedVaultUserHttpRepresentation'

@controller('/shared-vaults', TYPES.Sync_AuthMiddleware)
export class InversifyExpressSharedVaultsController extends BaseSharedVaultsController {
  constructor(
    @inject(TYPES.Sync_GetSharedVaults) override getSharedVaultsUseCase: GetSharedVaults,
    @inject(TYPES.Sync_CreateSharedVault) override createSharedVaultUseCase: CreateSharedVault,
    @inject(TYPES.Sync_DeleteSharedVault) override deleteSharedVaultUseCase: DeleteSharedVault,
    @inject(TYPES.Sync_CreateSharedVaultFileValetToken)
    override createSharedVaultFileValetTokenUseCase: CreateSharedVaultFileValetToken,
    @inject(TYPES.Sync_SharedVaultHttpMapper)
    override sharedVaultHttpMapper: MapperInterface<SharedVault, SharedVaultHttpRepresentation>,
    @inject(TYPES.Sync_SharedVaultUserHttpMapper)
    override sharedVaultUserHttpMapper: MapperInterface<SharedVaultUser, SharedVaultUserHttpRepresentation>,
  ) {
    super(
      getSharedVaultsUseCase,
      createSharedVaultUseCase,
      deleteSharedVaultUseCase,
      createSharedVaultFileValetTokenUseCase,
      sharedVaultHttpMapper,
      sharedVaultUserHttpMapper,
    )
  }

  @httpGet('/')
  override async getSharedVaults(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSharedVaults(request, response)
  }

  @httpPost('/')
  override async createSharedVault(request: Request, response: Response): Promise<results.JsonResult> {
    return super.createSharedVault(request, response)
  }

  @httpDelete('/:sharedVaultUuid')
  override async deleteSharedVault(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteSharedVault(request, response)
  }

  @httpPost('/:sharedVaultUuid/valet-tokens')
  override async createValetTokenForSharedVaultFile(request: Request, response: Response): Promise<results.JsonResult> {
    return super.createValetTokenForSharedVaultFile(request, response)
  }
}
