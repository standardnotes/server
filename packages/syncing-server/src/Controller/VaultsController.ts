import { VaultUser } from '../Domain/VaultUser/Model/VaultUser'
import { VaultServiceInterface } from '../Domain/Vault/Service/VaultServiceInterface'
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
import { Vault } from '../Domain/Vault/Model/Vault'
import { VaultProjection } from '../Projection/VaultProjection'
import { VaultUserProjection } from '../Projection/VaultUserProjection'
import { CreateVaultFileValetToken } from '../Domain/UseCase/CreateVaultFileValetToken/CreateVaultFileValetToken'
import { RemovedVaultUserServiceInterface } from '../Domain/RemovedVaultUser/Service/RemovedVaultUserServiceInterface'

@controller('/vaults')
export class VaultsController extends BaseHttpController {
  constructor(
    @inject(TYPES.VaultService) private vaultService: VaultServiceInterface,
    @inject(TYPES.RemovedVaultUserService) private removedVaultUserService: RemovedVaultUserServiceInterface,
    @inject(TYPES.VaultProjector) private vaultProjector: ProjectorInterface<Vault, VaultProjection>,
    @inject(TYPES.VaultUserProjector) private vaultUserProjector: ProjectorInterface<VaultUser, VaultUserProjection>,
    @inject(TYPES.CreateVaultFileReadValetToken) private createVaultFileReadValetToken: CreateVaultFileValetToken,
  ) {
    super()
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getVaults(_request: Request, response: Response): Promise<results.JsonResult> {
    const vaults = await this.vaultService.getVaults({
      userUuid: response.locals.user.uuid,
    })

    return this.json({
      vaults: vaults.map((vault) => this.vaultProjector.projectFull(vault)),
    })
  }

  @httpPost('/:vaultUuid/valet-tokens', TYPES.AuthMiddleware)
  public async getValetTokenForVaultFile(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const valetTokenResult = await this.createVaultFileReadValetToken.execute({
      userUuid: response.locals.user.uuid,
      vaultUuid: request.params.vaultUuid,
      fileUuid: request.body.file_uuid,
      remoteIdentifier: request.body.remote_identifier,
      operation: request.body.operation,
      unencryptedFileSize: request.body.unencrypted_file_size,
      moveOperationType: request.body.move_operation_type,
      vaultToVaultMoveTargetUuid: request.body.vault_to_vault_move_target_uuid,
    })

    if (valetTokenResult.success === false) {
      return this.errorResponse(400, `Failed to create vault valet token: ${valetTokenResult.reason}`)
    }

    return this.json({
      valetToken: valetTokenResult.valetToken,
    })
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async createVault(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultService.createVault({
      userUuid: response.locals.user.uuid,
      vaultUuid: request.body.vault_uuid,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not create vault')
    }

    return this.json({
      vault: this.vaultProjector.projectFull(result.vault),
      vaultUser: this.vaultUserProjector.projectFull(result.vaultUser),
    })
  }

  @httpPatch('/:vaultUuid', TYPES.AuthMiddleware)
  public async updateVault(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultService.updateVault({
      vaultUuid: request.params.vaultUuid,
      originatorUuid: response.locals.user.uuid,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not update vault')
    }

    return this.json({
      vault: this.vaultProjector.projectFull(result),
    })
  }

  @httpDelete('/:vaultUuid', TYPES.AuthMiddleware)
  public async deleteVault(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultService.deleteVault({
      vaultUuid: request.params.vaultUuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not delete vault')
    }

    return this.json({ success: true })
  }

  @httpGet('/removed', TYPES.AuthMiddleware)
  public async getAllRemovedFromVaultsForCurrentUser(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.removedVaultUserService.getAllRemovedVaultUsersForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get vault users')
    }

    return this.json({
      removedVaults: result.map((removedUser) => {
        return {
          vaultUuid: removedUser.vaultUuid,
          removedAt: removedUser.createdAtTimestamp,
        }
      }),
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
