import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { HttpStatusCode } from '@standardnotes/responses'
import { ControllerContainerInterface, MapperInterface } from '@standardnotes/domain-core'

import { InviteUserToSharedVault } from '../../../Domain/UseCase/SharedVaults/InviteUserToSharedVault/InviteUserToSharedVault'
import { SharedVaultInvite } from '../../../Domain/SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultInviteHttpRepresentation } from '../../../Mapping/Http/SharedVaultInviteHttpRepresentation'
import { UpdateSharedVaultInvite } from '../../../Domain/UseCase/SharedVaults/UpdateSharedVaultInvite/UpdateSharedVaultInvite'
import { AcceptInviteToSharedVault } from '../../../Domain/UseCase/SharedVaults/AcceptInviteToSharedVault/AcceptInviteToSharedVault'
import { DeclineInviteToSharedVault } from '../../../Domain/UseCase/SharedVaults/DeclineInviteToSharedVault/DeclineInviteToSharedVault'
import { DeleteSharedVaultInvitesToUser } from '../../../Domain/UseCase/SharedVaults/DeleteSharedVaultInvitesToUser/DeleteSharedVaultInvitesToUser'
import { GetSharedVaultInvitesSentByUser } from '../../../Domain/UseCase/SharedVaults/GetSharedVaultInvitesSentByUser/GetSharedVaultInvitesSentByUser'
import { DeleteSharedVaultInvitesSentByUser } from '../../../Domain/UseCase/SharedVaults/DeleteSharedVaultInvitesSentByUser/DeleteSharedVaultInvitesSentByUser'
import { GetSharedVaultInvitesSentToUser } from '../../../Domain/UseCase/SharedVaults/GetSharedVaultInvitesSentToUser/GetSharedVaultInvitesSentToUser'

export class HomeServerSharedVaultInvitesController extends BaseHttpController {
  constructor(
    protected inviteUserToSharedVaultUseCase: InviteUserToSharedVault,
    protected updateSharedVaultInviteUseCase: UpdateSharedVaultInvite,
    protected acceptSharedVaultInviteUseCase: AcceptInviteToSharedVault,
    protected declineSharedVaultInviteUseCase: DeclineInviteToSharedVault,
    protected deleteSharedVaultInvitesToUserUseCase: DeleteSharedVaultInvitesToUser,
    protected deleteSharedVaultInvitesSentByUserUseCase: DeleteSharedVaultInvitesSentByUser,
    protected getSharedVaultInvitesSentByUserUseCase: GetSharedVaultInvitesSentByUser,
    protected getSharedVaultInvitesSentToUserUseCase: GetSharedVaultInvitesSentToUser,
    protected sharedVaultInviteHttpMapper: MapperInterface<SharedVaultInvite, SharedVaultInviteHttpRepresentation>,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('sync.shared-vault-invites.create', this.createSharedVaultInvite.bind(this))
      this.controllerContainer.register('sync.shared-vault-invites.update', this.updateSharedVaultInvite.bind(this))
      this.controllerContainer.register('sync.shared-vault-invites.accept', this.acceptSharedVaultInvite.bind(this))
      this.controllerContainer.register('sync.shared-vault-invites.decline', this.declineSharedVaultInvite.bind(this))
      this.controllerContainer.register(
        'sync.shared-vault-invites.delete-inbound',
        this.deleteInboundUserInvites.bind(this),
      )
      this.controllerContainer.register(
        'sync.shared-vault-invites.get-outbound',
        this.getOutboundUserInvites.bind(this),
      )
      this.controllerContainer.register('sync.shared-vault-invites.get-user-invites', this.getUserInvites.bind(this))
      this.controllerContainer.register(
        'sync.shared-vault-invites.delete-invite',
        this.deleteSharedVaultInvite.bind(this),
      )
      this.controllerContainer.register(
        'sync.shared-vault-invites.delete-all',
        this.deleteAllSharedVaultInvites.bind(this),
      )
    }
  }

  async createSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.inviteUserToSharedVaultUseCase.execute({
      sharedVaultUuid: request.params.sharedVaultUuid,
      senderUuid: response.locals.user.uuid,
      recipientUuid: request.body.recipient_uid,
      encryptedMessage: request.body.encrypted_message,
      permission: request.body.permission,
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
      invite: this.sharedVaultInviteHttpMapper.toProjection(result.getValue()),
    })
  }

  async updateSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.updateSharedVaultInviteUseCase.execute({
      encryptedMessage: request.body.encrypted_message,
      inviteUuid: request.params.inviteUuid,
      senderUuid: response.locals.user.uuid,
      permission: request.body.permission,
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
      invite: this.sharedVaultInviteHttpMapper.toProjection(result.getValue()),
    })
  }

  async acceptSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.acceptSharedVaultInviteUseCase.execute({
      inviteUuid: request.params.inviteUuid,
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

  async declineSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.declineSharedVaultInviteUseCase.execute({
      inviteUuid: request.params.inviteUuid,
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

  async deleteInboundUserInvites(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.deleteSharedVaultInvitesToUserUseCase.execute({
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
      success: true,
    })
  }

  async getOutboundUserInvites(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getSharedVaultInvitesSentByUserUseCase.execute({
      senderUuid: response.locals.user.uuid,
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
      invites: result.getValue().map((invite) => this.sharedVaultInviteHttpMapper.toProjection(invite)),
    })
  }

  async getSharedVaultInvites(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getSharedVaultInvitesSentByUserUseCase.execute({
      senderUuid: response.locals.user.uuid,
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
      invites: result.getValue().map((invite) => this.sharedVaultInviteHttpMapper.toProjection(invite)),
    })
  }

  async getUserInvites(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getSharedVaultInvitesSentToUserUseCase.execute({
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
      invites: result.getValue().map((invite) => this.sharedVaultInviteHttpMapper.toProjection(invite)),
    })
  }

  async deleteSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.declineSharedVaultInviteUseCase.execute({
      inviteUuid: request.params.inviteUuid,
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

  async deleteAllSharedVaultInvites(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.deleteSharedVaultInvitesSentByUserUseCase.execute({
      userUuid: response.locals.user.uuid,
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
      success: true,
    })
  }
}
