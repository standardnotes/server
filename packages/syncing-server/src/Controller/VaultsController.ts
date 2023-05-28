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
import { VaultUserServiceInterface } from '../Domain/VaultUser/Service/VaultUserServiceInterface'
import { CreateVaultFileReadValetToken } from '../Domain/UseCase/CreateVaultFileValetToken/CreateVaultFileReadValetToken'

@controller('/vaults')
export class VaultsController extends BaseHttpController {
  constructor(
    @inject(TYPES.VaultService) private vaultService: VaultServiceInterface,
    @inject(TYPES.VaultUserService) private vaultUserService: VaultUserServiceInterface,
    @inject(TYPES.VaultProjector) private vaultProjector: ProjectorInterface<Vault, VaultProjection>,
    @inject(TYPES.VaultUserProjector) private vaultUserProjector: ProjectorInterface<VaultUser, VaultUserProjection>,
    @inject(TYPES.CreateVaultFileReadValetToken) private createVaultFileReadValetToken: CreateVaultFileReadValetToken,
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
      vaultKeyTimestamp: request.body.vault_key_timestamp,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not create vault')
    }

    const vaultUser = await this.vaultUserService.addVaultUser({
      vaultUuid: result.uuid,
      userUuid: response.locals.user.uuid,
      permissions: 'admin',
    })

    if (!vaultUser) {
      return this.errorResponse(400, 'Could not add user to vault')
    }

    return this.json({
      vault: this.vaultProjector.projectFull(result),
      vaultUser: this.vaultUserProjector.projectFull(vaultUser),
    })
  }

  @httpPatch('/:vaultUuid', TYPES.AuthMiddleware)
  public async updateVault(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultService.updateVault({
      vaultUuid: request.params.vaultUuid,
      originatorUuid: response.locals.user.uuid,
      vaultKeyTimestamp: request.body.vault_key_timestamp,
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

  private errorResponse(status: number, message?: string, tag?: string) {
    return this.json(
      {
        error: { message, tag },
      },
      status,
    )
  }
}
