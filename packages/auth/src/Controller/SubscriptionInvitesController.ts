import {
  AppleIAPConfirmRequestParams,
  AppleIAPConfirmResponseBody,
  SubscriptionInviteAcceptRequestParams,
  SubscriptionInviteAcceptResponseBody,
  SubscriptionInviteCancelRequestParams,
  SubscriptionInviteCancelResponseBody,
  SubscriptionInviteDeclineRequestParams,
  SubscriptionInviteDeclineResponseBody,
  SubscriptionInviteListRequestParams,
  SubscriptionInviteListResponseBody,
  SubscriptionInviteRequestParams,
  SubscriptionInviteResponseBody,
  SubscriptionServerInterface,
} from '@standardnotes/api'
import { HttpResponse, HttpStatusCode } from '@standardnotes/responses'
import { inject, injectable } from 'inversify'

import TYPES from '../Bootstrap/Types'
import { AcceptSharedSubscriptionInvitation } from '../Domain/UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'
import { CancelSharedSubscriptionInvitation } from '../Domain/UseCase/CancelSharedSubscriptionInvitation/CancelSharedSubscriptionInvitation'
import { DeclineSharedSubscriptionInvitation } from '../Domain/UseCase/DeclineSharedSubscriptionInvitation/DeclineSharedSubscriptionInvitation'
import { InviteToSharedSubscription } from '../Domain/UseCase/InviteToSharedSubscription/InviteToSharedSubscription'
import { ListSharedSubscriptionInvitations } from '../Domain/UseCase/ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'

@injectable()
export class SubscriptionInvitesController implements SubscriptionServerInterface {
  constructor(
    @inject(TYPES.Auth_InviteToSharedSubscription) private inviteToSharedSubscription: InviteToSharedSubscription,
    @inject(TYPES.Auth_AcceptSharedSubscriptionInvitation)
    private acceptSharedSubscriptionInvitation: AcceptSharedSubscriptionInvitation,
    @inject(TYPES.Auth_DeclineSharedSubscriptionInvitation)
    private declineSharedSubscriptionInvitation: DeclineSharedSubscriptionInvitation,
    @inject(TYPES.Auth_CancelSharedSubscriptionInvitation)
    private cancelSharedSubscriptionInvitation: CancelSharedSubscriptionInvitation,
    @inject(TYPES.Auth_ListSharedSubscriptionInvitations)
    private listSharedSubscriptionInvitations: ListSharedSubscriptionInvitations,
  ) {}

  async confirmAppleIAP(_params: AppleIAPConfirmRequestParams): Promise<HttpResponse<AppleIAPConfirmResponseBody>> {
    throw new Error('Method implemented on the payments service.')
  }

  async acceptInvite(
    params: SubscriptionInviteAcceptRequestParams,
  ): Promise<HttpResponse<SubscriptionInviteAcceptResponseBody>> {
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

  async declineInvite(
    params: SubscriptionInviteDeclineRequestParams,
  ): Promise<HttpResponse<SubscriptionInviteDeclineResponseBody>> {
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

  async invite(params: SubscriptionInviteRequestParams): Promise<HttpResponse<SubscriptionInviteResponseBody>> {
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
      inviterRoles: params.inviterRoles as string[],
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

  async cancelInvite(
    params: SubscriptionInviteCancelRequestParams,
  ): Promise<HttpResponse<SubscriptionInviteCancelResponseBody>> {
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

  async listInvites(
    params: SubscriptionInviteListRequestParams,
  ): Promise<HttpResponse<SubscriptionInviteListResponseBody>> {
    const result = await this.listSharedSubscriptionInvitations.execute({
      inviterEmail: params.inviterEmail as string,
    })

    return {
      status: HttpStatusCode.Success,
      data: result,
    }
  }
}
