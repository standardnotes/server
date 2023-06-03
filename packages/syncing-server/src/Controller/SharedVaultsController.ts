import { SharedVaultUser } from '../Domain/SharedVaultUser/Model/SharedVaultUser'
import { SharedVaultServiceInterface } from '../Domain/SharedVault/Service/SharedVaultServiceInterface'
import { Request, Response } from 'express'
import {
  BaseHttpController,
  controller,
  httpPost,
  results,
  httpDelete,
  httpPatch,
  httpGet,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { SharedVault } from '../Domain/SharedVault/Model/SharedVault'
import { SharedVaultProjection } from '../Projection/SharedVaultProjection'
import { SharedVaultUserProjection } from '../Projection/SharedVaultUserProjection'
import { CreateSharedVaultFileValetToken } from '../Domain/UseCase/CreateSharedVaultFileValetToken/CreateSharedVaultFileValetToken'
import { RemovedSharedVaultUserServiceInterface } from '../Domain/RemovedSharedVaultUser/Service/RemovedSharedVaultUserServiceInterface'
import { Item } from '../Domain/Item/Item'
import { SavedItemProjection } from '../Projection/SavedItemProjection'

@controller('/shared-vaults')
export class SharedVaultsController extends BaseHttpController {
  constructor(
    @inject(TYPES.SharedVaultService) private sharedVaultService: SharedVaultServiceInterface,
    @inject(TYPES.RemovedSharedVaultUserService)
    private removedSharedVaultUserService: RemovedSharedVaultUserServiceInterface,
    @inject(TYPES.SharedVaultProjector)
    private sharedVaultProjector: ProjectorInterface<SharedVault, SharedVaultProjection>,
    @inject(TYPES.SharedVaultUserProjector)
    private sharedVaultUserProjector: ProjectorInterface<SharedVaultUser, SharedVaultUserProjection>,
    @inject(TYPES.CreateSharedVaultFileReadValetToken)
    private createSharedVaultFileReadValetToken: CreateSharedVaultFileValetToken,
    @inject(TYPES.SavedItemProjector) private savedItemProjector: ProjectorInterface<Item, SavedItemProjection>,
  ) {
    super()
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getSharedVaults(_request: Request, response: Response): Promise<results.JsonResult> {
    const sharedVaults = await this.sharedVaultService.getSharedVaults({
      userUuid: response.locals.user.uuid,
    })

    return this.json({
      sharedVaults: sharedVaults.map((sharedVault) => this.sharedVaultProjector.projectFull(sharedVault)),
    })
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async createSharedVault(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultService.createSharedVault({
      userUuid: response.locals.user.uuid,
      keySystemIdentifier: request.body.key_system_identifier,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not create shared vault')
    }

    return this.json({
      sharedVault: this.sharedVaultProjector.projectFull(result.sharedVault),
      sharedVaultUser: this.sharedVaultUserProjector.projectFull(result.sharedVaultUser),
    })
  }

  @httpPatch('/:sharedVaultUuid', TYPES.AuthMiddleware)
  public async updateSharedVault(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultService.updateSharedVault({
      sharedVaultUuid: request.params.sharedVaultUuid,
      originatorUuid: response.locals.user.uuid,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not update shared vault')
    }

    return this.json({
      sharedVault: this.sharedVaultProjector.projectFull(result),
    })
  }

  @httpDelete('/:sharedVaultUuid', TYPES.AuthMiddleware)
  public async deleteSharedVault(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultService.deleteSharedVault({
      sharedVaultUuid: request.params.sharedVaultUuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not delete shared vault')
    }

    return this.json({ success: true })
  }

  @httpPost('/:sharedVaultUuid/add-item', TYPES.AuthMiddleware)
  public async addItemToSharedVault(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultService.addItemToSharedVault({
      sharedVaultUuid: request.params.sharedVaultUuid,
      itemUuid: request.body.item_uuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not add item to shared vault')
    }

    return this.json({
      item: this.savedItemProjector.projectFull(result),
    })
  }

  @httpDelete('/:sharedVaultUuid/remove-item', TYPES.AuthMiddleware)
  public async removeItemFromSharedVault(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultService.removeItemFromSharedVault({
      sharedVaultUuid: request.params.sharedVaultUuid,
      itemUuid: request.body.item_uuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not remove item from shared vault')
    }

    return this.json({
      item: this.savedItemProjector.projectFull(result),
    })
  }

  @httpGet('/removed', TYPES.AuthMiddleware)
  public async getAllRemovedFromSharedVaultsForCurrentUser(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.removedSharedVaultUserService.getAllRemovedSharedVaultUsersForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get shared vault users')
    }

    return this.json({
      removedSharedVaults: result.map((removedUser) => {
        return {
          sharedVaultUuid: removedUser.sharedVaultUuid,
          removedAt: removedUser.createdAtTimestamp,
        }
      }),
    })
  }

  @httpPost('/:sharedVaultUuid/valet-tokens', TYPES.AuthMiddleware)
  public async getValetTokenForSharedVaultFile(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const valetTokenResult = await this.createSharedVaultFileReadValetToken.execute({
      userUuid: response.locals.user.uuid,
      sharedVaultUuid: request.params.sharedVaultUuid,
      fileUuid: request.body.file_uuid,
      remoteIdentifier: request.body.remote_identifier,
      operation: request.body.operation,
      unencryptedFileSize: request.body.unencrypted_file_size,
      moveOperationType: request.body.move_operation_type,
      sharedVaultToSharedVaultMoveTargetUuid: request.body.shared_vault_to_shared_vault_move_target_uuid,
    })

    if (valetTokenResult.success === false) {
      return this.errorResponse(400, `Failed to create shared vault valet token: ${valetTokenResult.reason}`)
    }

    return this.json({
      valetToken: valetTokenResult.valetToken,
    })
  }

  private errorResponse(status: number, message?: string, tag?: string) {
    return this.json(
      {
        error: { message, tag },
      },
      status,
    )
  }
}
