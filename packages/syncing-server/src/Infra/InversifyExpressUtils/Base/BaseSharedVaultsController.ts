import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { HttpStatusCode } from '@standardnotes/responses'
import { ControllerContainerInterface, MapperInterface, SharedVaultUser } from '@standardnotes/domain-core'
import { Role } from '@standardnotes/security'

import { GetSharedVaults } from '../../../Domain/UseCase/SharedVaults/GetSharedVaults/GetSharedVaults'
import { SharedVault } from '../../../Domain/SharedVault/SharedVault'
import { SharedVaultHttpRepresentation } from '../../../Mapping/Http/SharedVaultHttpRepresentation'
import { CreateSharedVault } from '../../../Domain/UseCase/SharedVaults/CreateSharedVault/CreateSharedVault'
import { SharedVaultUserHttpRepresentation } from '../../../Mapping/Http/SharedVaultUserHttpRepresentation'
import { DeleteSharedVault } from '../../../Domain/UseCase/SharedVaults/DeleteSharedVault/DeleteSharedVault'
import { CreateSharedVaultFileValetToken } from '../../../Domain/UseCase/SharedVaults/CreateSharedVaultFileValetToken/CreateSharedVaultFileValetToken'

export class BaseSharedVaultsController extends BaseHttpController {
  constructor(
    protected getSharedVaultsUseCase: GetSharedVaults,
    protected createSharedVaultUseCase: CreateSharedVault,
    protected deleteSharedVaultUseCase: DeleteSharedVault,
    protected createSharedVaultFileValetTokenUseCase: CreateSharedVaultFileValetToken,
    protected sharedVaultHttpMapper: MapperInterface<SharedVault, SharedVaultHttpRepresentation>,
    protected sharedVaultUserHttpMapper: MapperInterface<SharedVaultUser, SharedVaultUserHttpRepresentation>,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('sync.shared-vaults.get-vaults', this.getSharedVaults.bind(this))
      this.controllerContainer.register('sync.shared-vaults.create-vault', this.createSharedVault.bind(this))
      this.controllerContainer.register('sync.shared-vaults.delete-vault', this.deleteSharedVault.bind(this))
      this.controllerContainer.register(
        'sync.shared-vaults.create-file-valet-token',
        this.createValetTokenForSharedVaultFile.bind(this),
      )
    }
  }

  async getSharedVaults(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getSharedVaultsUseCase.execute({
      userUuid: response.locals.user.uuid,
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
      sharedVaults: result.getValue().map((sharedVault) => this.sharedVaultHttpMapper.toProjection(sharedVault)),
    })
  }

  async createSharedVault(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.createSharedVaultUseCase.execute({
      userUuid: response.locals.user.uuid,
      userRoleNames: response.locals.roles.map((role: Role) => role.name),
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
      sharedVault: this.sharedVaultHttpMapper.toProjection(result.getValue().sharedVault),
      sharedVaultUser: this.sharedVaultUserHttpMapper.toProjection(result.getValue().sharedVaultUser),
    })
  }

  async deleteSharedVault(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.deleteSharedVaultUseCase.execute({
      sharedVaultUuid: request.params.sharedVaultUuid,
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

    return this.json({ success: true })
  }

  async createValetTokenForSharedVaultFile(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.createSharedVaultFileValetTokenUseCase.execute({
      userUuid: response.locals.user.uuid,
      sharedVaultUuid: request.params.sharedVaultUuid,
      sharedVaultOwnerUploadBytesLimit: response.locals.sharedVaultOwnerContext?.upload_bytes_limit,
      fileUuid: request.body.file_uuid,
      remoteIdentifier: request.body.remote_identifier,
      operation: request.body.operation,
      unencryptedFileSize: request.body.unencrypted_file_size,
      moveOperationType: request.body.move_operation_type,
      sharedVaultToSharedVaultMoveTargetUuid: request.body.shared_vault_to_shared_vault_move_target_uuid,
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
      valetToken: result.getValue(),
    })
  }
}
