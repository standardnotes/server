import { Request, Response } from 'express'
import {
  BaseHttpController,
  controller,
  httpPost,
  results,
  httpDelete,
  httpGet,
  httpPatch,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { VaultInviteServiceInterface } from '../Domain/VaultInvite/Service/VaultInviteServiceInterface'
import { VaultInviteProjector } from '../Projection/VaultInviteProjector'

@controller('/vaults')
export class VaultInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.VaultInviteService) private vaultInviteService: VaultInviteServiceInterface,
    @inject(TYPES.VaultInviteProjector) private vaultInviteProjector: VaultInviteProjector,
  ) {
    super()
  }

  @httpPost('/:vaultUuid/invites', TYPES.AuthMiddleware)
  public async createVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultInviteService.createInvite({
      originatorUuid: response.locals.user.uuid,
      vaultUuid: request.params.vaultUuid,
      userUuid: request.body.invitee_uuid,
      inviterPublicKey: request.body.inviter_public_key,
      encryptedVaultData: request.body.encrypted_vault_data,
      inviteType: request.body.invite_type,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not create invite')
    }

    return this.json({ invite: this.vaultInviteProjector.projectFull(result) })
  }

  @httpPatch('/:vaultUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async updateVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultInviteService.updateInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
      inviterPublicKey: request.body.inviter_public_key,
      encryptedVaultData: request.body.encrypted_vault_data,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not update invite')
    }

    return this.json({ invite: this.vaultInviteProjector.projectFull(result) })
  }

  @httpPost('/:vaultUuid/invites/:inviteUuid/accept', TYPES.AuthMiddleware)
  public async acceptVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultInviteService.acceptInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not accept invite')
    }

    return this.json({ success: true })
  }

  @httpPost('/:vaultUuid/invites/:inviteUuid/decline', TYPES.AuthMiddleware)
  public async declineVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultInviteService.declineInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not decline invite')
    }

    return this.json({ success: true })
  }

  @httpDelete('/invites/inbound', TYPES.AuthMiddleware)
  public async deleteInboundUserInvites(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    await this.vaultInviteService.deleteAllInboundInvites({
      userUuid: response.locals.user.uuid,
    })

    return this.json({ success: true })
  }

  @httpGet('/invites/outbound', TYPES.AuthMiddleware)
  public async getOutboundUserInvites(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultInviteService.getOutboundInvitesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get vault invites')
    }

    const projected = result.map((invite) => this.vaultInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpGet('/invites', TYPES.AuthMiddleware)
  public async getUserInvites(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultInviteService.getInvitesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get vault invites')
    }

    const projected = result.map((invite) => this.vaultInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpGet('/:vaultUuid/invites', TYPES.AuthMiddleware)
  public async getVaultInvites(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultInviteService.getInvitesForVault({
      originatorUuid: response.locals.user.uuid,
      vaultUuid: request.params.vaultUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get vault invites')
    }

    const projected = result.map((invite) => this.vaultInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpDelete('/:vaultUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async deleteVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultInviteService.deleteInvite({
      originatorUuid: response.locals.user.uuid,
      vaultUuid: request.params.vaultUuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not delete invite')
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
