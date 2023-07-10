import { controller, httpDelete, httpGet, results } from 'inversify-express-utils'
import { inject } from 'inversify'
import { MapperInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'

import { HomeServerSharedVaultUsersController } from './HomeServer/HomeServerSharedVaultUsersController'
import TYPES from '../../Bootstrap/Types'
import { SharedVaultUser } from '../../Domain/SharedVault/User/SharedVaultUser'
import { SharedVaultUserHttpRepresentation } from '../../Mapping/Http/SharedVaultUserHttpRepresentation'
import { GetSharedVaultUsers } from '../../Domain/UseCase/SharedVaults/GetSharedVaultUsers/GetSharedVaultUsers'
import { RemoveUserFromSharedVault } from '../../Domain/UseCase/SharedVaults/RemoveUserFromSharedVault/RemoveUserFromSharedVault'

@controller('/shared-vaults/:sharedVaultUuid/users', TYPES.Sync_AuthMiddleware)
export class InversifyExpressSharedVaultUsersController extends HomeServerSharedVaultUsersController {
  constructor(
    @inject(TYPES.Sync_GetSharedVaultUsers) override getSharedVaultUsersUseCase: GetSharedVaultUsers,
    @inject(TYPES.Sync_RemoveSharedVaultUser) override removeUserFromSharedVaultUseCase: RemoveUserFromSharedVault,
    @inject(TYPES.Sync_SharedVaultUserHttpMapper)
    override sharedVaultUserHttpMapper: MapperInterface<SharedVaultUser, SharedVaultUserHttpRepresentation>,
  ) {
    super(getSharedVaultUsersUseCase, removeUserFromSharedVaultUseCase, sharedVaultUserHttpMapper)
  }

  @httpGet('/')
  override async getSharedVaultUsers(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSharedVaultUsers(request, response)
  }

  @httpDelete('/:userUuid')
  override async removeUserFromSharedVault(request: Request, response: Response): Promise<results.JsonResult> {
    return super.removeUserFromSharedVault(request, response)
  }
}
