import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { HttpStatusCode } from '@standardnotes/responses'
import { ControllerContainerInterface, MapperInterface, SharedVaultUser } from '@standardnotes/domain-core'

import { SharedVaultUserHttpRepresentation } from '../../../Mapping/Http/SharedVaultUserHttpRepresentation'
import { GetSharedVaultUsers } from '../../../Domain/UseCase/SharedVaults/GetSharedVaultUsers/GetSharedVaultUsers'
import { RemoveUserFromSharedVault } from '../../../Domain/UseCase/SharedVaults/RemoveUserFromSharedVault/RemoveUserFromSharedVault'

export class BaseSharedVaultUsersController extends BaseHttpController {
  constructor(
    protected getSharedVaultUsersUseCase: GetSharedVaultUsers,
    protected removeUserFromSharedVaultUseCase: RemoveUserFromSharedVault,
    protected sharedVaultUserHttpMapper: MapperInterface<SharedVaultUser, SharedVaultUserHttpRepresentation>,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('sync.shared-vault-users.get-users', this.getSharedVaultUsers.bind(this))
      this.controllerContainer.register(
        'sync.shared-vault-users.remove-user',
        this.removeUserFromSharedVault.bind(this),
      )
    }
  }

  async getSharedVaultUsers(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getSharedVaultUsersUseCase.execute({
      originatorUuid: response.locals.user.uuid,
      sharedVaultUuid: request.params.sharedVaultUuid,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({
      users: result.getValue().map((sharedVault) => this.sharedVaultUserHttpMapper.toProjection(sharedVault)),
    })
  }

  async removeUserFromSharedVault(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.removeUserFromSharedVaultUseCase.execute({
      sharedVaultUuid: request.params.sharedVaultUuid,
      userUuid: request.params.userUuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    return this.json({
      success: true,
    })
  }
}
