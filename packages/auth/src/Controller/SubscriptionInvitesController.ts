import {
  HttpStatusCode,
  SubscriptionInviteAcceptRequestParams,
  SubscriptionInviteAcceptResponse,
  SubscriptionInviteCancelRequestParams,
  SubscriptionInviteCancelResponse,
  SubscriptionInviteDeclineRequestParams,
  SubscriptionInviteDeclineResponse,
  SubscriptionInviteListRequestParams,
  SubscriptionInviteListResponse,
  SubscriptionInviteRequestParams,
  SubscriptionInviteResponse,
  SubscriptionServerInterface,
} from '@standardnotes/api'
import { RoleName } from '@standardnotes/common'
import { inject } from 'inversify'

import TYPES from '../Bootstrap/Types'
import { AcceptSharedSubscriptionInvitation } from '../Domain/UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'
import { CancelSharedSubscriptionInvitation } from '../Domain/UseCase/CancelSharedSubscriptionInvitation/CancelSharedSubscriptionInvitation'
import { DeclineSharedSubscriptionInvitation } from '../Domain/UseCase/DeclineSharedSubscriptionInvitation/DeclineSharedSubscriptionInvitation'
import { InviteToSharedSubscription } from '../Domain/UseCase/InviteToSharedSubscription/InviteToSharedSubscription'
import { ListSharedSubscriptionInvitations } from '../Domain/UseCase/ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'

export class SubscriptionInvitesController implements SubscriptionServerInterface {
  constructor(
    @inject(TYPES.InviteToSharedSubscription) private inviteToSharedSubscription: InviteToSharedSubscription,
    @inject(TYPES.AcceptSharedSubscriptionInvitation)
    private acceptSharedSubscriptionInvitation: AcceptSharedSubscriptionInvitation,
    @inject(TYPES.DeclineSharedSubscriptionInvitation)
    private declineSharedSubscriptionInvitation: DeclineSharedSubscriptionInvitation,
    @inject(TYPES.CancelSharedSubscriptionInvitation)
    private cancelSharedSubscriptionInvitation: CancelSharedSubscriptionInvitation,
    @inject(TYPES.ListSharedSubscriptionInvitations)
    private listSharedSubscriptionInvitations: ListSharedSubscriptionInvitations,
  ) {}

  async acceptInvite(params: SubscriptionInviteAcceptRequestParams): Promise<SubscriptionInviteAcceptResponse> {
    const result = await this.acceptSharedSubscriptionInvitation.execute({
      sharedSubscriptionInvitationUuid: params.inviteUuid,
    })

    if (result.success) {
      return {
        status: HttpStatusCode.Success,
        data: result,
      }
    }

    return {
      status: HttpStatusCode.BadRequest,
      data: result,
    }
  }

  async declineInvite(params: SubscriptionInviteDeclineRequestParams): Promise<SubscriptionInviteDeclineResponse> {
    const result = await this.declineSharedSubscriptionInvitation.execute({
      sharedSubscriptionInvitationUuid: params.inviteUuid,
    })

    if (result.success) {
      return {
        status: HttpStatusCode.Success,
        data: result,
      }
    }

    return {
      status: HttpStatusCode.BadRequest,
      data: result,
    }
  }

  async invite(params: SubscriptionInviteRequestParams): Promise<SubscriptionInviteResponse> {
    if (!params.identifier) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Missing invitee identifier',
          },
        },
      }
    }

    const result = await this.inviteToSharedSubscription.execute({
      inviterEmail: params.inviterEmail as string,
      inviterUuid: params.inviterUuid as string,
      inviteeIdentifier: params.identifier,
      inviterRoles: params.inviterRoles as RoleName[],
    })

    if (result.success) {
      return {
        status: HttpStatusCode.Success,
        data: result,
      }
    }

    return {
      status: HttpStatusCode.BadRequest,
      data: result,
    }
  }

  async cancelInvite(params: SubscriptionInviteCancelRequestParams): Promise<SubscriptionInviteCancelResponse> {
    const result = await this.cancelSharedSubscriptionInvitation.execute({
      sharedSubscriptionInvitationUuid: params.inviteUuid,
      inviterEmail: params.inviterEmail as string,
    })

    if (result.success) {
      return {
        status: HttpStatusCode.Success,
        data: result,
      }
    }

    return {
      status: HttpStatusCode.BadRequest,
      data: result,
    }
  }

  async listInvites(params: SubscriptionInviteListRequestParams): Promise<SubscriptionInviteListResponse> {
    const result = await this.listSharedSubscriptionInvitations.execute({
      inviterEmail: params.inviterEmail as string,
    })

    return {
      status: HttpStatusCode.Success,
      data: result,
    }
  }
}
