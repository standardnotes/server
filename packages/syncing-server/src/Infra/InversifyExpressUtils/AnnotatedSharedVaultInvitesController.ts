import { controller, httpDelete, httpGet, httpPatch, httpPost, results } from 'inversify-express-utils'
import { MapperInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'

import TYPES from '../../Bootstrap/Types'
import { SharedVaultInvite } from '../../Domain/SharedVault/User/Invite/SharedVaultInvite'
import { AcceptInviteToSharedVault } from '../../Domain/UseCase/SharedVaults/AcceptInviteToSharedVault/AcceptInviteToSharedVault'
import { CancelInviteToSharedVault } from '../../Domain/UseCase/SharedVaults/CancelInviteToSharedVault/CancelInviteToSharedVault'
import { DeleteSharedVaultInvitesSentByUser } from '../../Domain/UseCase/SharedVaults/DeleteSharedVaultInvitesSentByUser/DeleteSharedVaultInvitesSentByUser'
import { DeleteSharedVaultInvitesToUser } from '../../Domain/UseCase/SharedVaults/DeleteSharedVaultInvitesToUser/DeleteSharedVaultInvitesToUser'
import { GetSharedVaultInvitesSentByUser } from '../../Domain/UseCase/SharedVaults/GetSharedVaultInvitesSentByUser/GetSharedVaultInvitesSentByUser'
import { InviteUserToSharedVault } from '../../Domain/UseCase/SharedVaults/InviteUserToSharedVault/InviteUserToSharedVault'
import { UpdateSharedVaultInvite } from '../../Domain/UseCase/SharedVaults/UpdateSharedVaultInvite/UpdateSharedVaultInvite'
import { SharedVaultInviteHttpRepresentation } from '../../Mapping/Http/SharedVaultInviteHttpRepresentation'
import { BaseSharedVaultInvitesController } from './Base/BaseSharedVaultInvitesController'
import { GetSharedVaultInvitesSentToUser } from '../../Domain/UseCase/SharedVaults/GetSharedVaultInvitesSentToUser/GetSharedVaultInvitesSentToUser'
import { inject } from 'inversify'

@controller('/shared-vaults', TYPES.Sync_AuthMiddleware)
export class AnnotatedSharedVaultInvitesController extends BaseSharedVaultInvitesController {
  constructor(
    @inject(TYPES.Sync_InviteUserToSharedVault) override inviteUserToSharedVaultUseCase: InviteUserToSharedVault,
    @inject(TYPES.Sync_UpdateSharedVaultInvite) override updateSharedVaultInviteUseCase: UpdateSharedVaultInvite,
    @inject(TYPES.Sync_AcceptInviteToSharedVault) override acceptSharedVaultInviteUseCase: AcceptInviteToSharedVault,
    @inject(TYPES.Sync_DeclineInviteToSharedVault) override declineSharedVaultInviteUseCase: CancelInviteToSharedVault,
    @inject(TYPES.Sync_DeleteSharedVaultInvitesToUser)
    override deleteSharedVaultInvitesToUserUseCase: DeleteSharedVaultInvitesToUser,
    @inject(TYPES.Sync_DeleteSharedVaultInvitesSentByUser)
    override deleteSharedVaultInvitesSentByUserUseCase: DeleteSharedVaultInvitesSentByUser,
    @inject(TYPES.Sync_GetSharedVaultInvitesSentByUser)
    override getSharedVaultInvitesSentByUserUseCase: GetSharedVaultInvitesSentByUser,
    @inject(TYPES.Sync_GetSharedVaultInvitesSentToUser)
    override getSharedVaultInvitesSentToUserUseCase: GetSharedVaultInvitesSentToUser,
    @inject(TYPES.Sync_SharedVaultInviteHttpMapper)
    override sharedVaultInviteHttpMapper: MapperInterface<SharedVaultInvite, SharedVaultInviteHttpRepresentation>,
  ) {
    super(
      inviteUserToSharedVaultUseCase,
      updateSharedVaultInviteUseCase,
      acceptSharedVaultInviteUseCase,
      declineSharedVaultInviteUseCase,
      deleteSharedVaultInvitesToUserUseCase,
      deleteSharedVaultInvitesSentByUserUseCase,
      getSharedVaultInvitesSentByUserUseCase,
      getSharedVaultInvitesSentToUserUseCase,
      sharedVaultInviteHttpMapper,
    )
  }

  @httpPost('/:sharedVaultUuid/invites')
  override async createSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    return super.createSharedVaultInvite(request, response)
  }

  @httpPatch('/:sharedVaultUuid/invites/:inviteUuid')
  override async updateSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    return super.updateSharedVaultInvite(request, response)
  }

  @httpPost('/:sharedVaultUuid/invites/:inviteUuid/accept')
  override async acceptSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    return super.acceptSharedVaultInvite(request, response)
  }

  @httpPost('/:sharedVaultUuid/invites/:inviteUuid/decline')
  override async declineSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    return super.declineSharedVaultInvite(request, response)
  }

  @httpDelete('/invites/inbound')
  override async deleteInboundUserInvites(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteInboundUserInvites(request, response)
  }

  @httpDelete('/invites/outbound')
  override async deleteOutboundUserInvites(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteOutboundUserInvites(request, response)
  }

  @httpGet('/invites/outbound')
  override async getOutboundUserInvites(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getOutboundUserInvites(request, response)
  }

  @httpGet('/invites')
  override async getUserInvites(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getUserInvites(request, response)
  }

  @httpGet('/:sharedVaultUuid/invites')
  override async getSharedVaultInvites(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSharedVaultInvites(request, response)
  }

  @httpDelete('/:sharedVaultUuid/invites/:inviteUuid')
  override async deleteSharedVaultInvite(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteSharedVaultInvite(request, response)
  }

  @httpDelete('/:sharedVaultUuid/invites')
  override async deleteAllSharedVaultInvites(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteAllSharedVaultInvites(request, response)
  }
}
