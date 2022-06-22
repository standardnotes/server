import 'reflect-metadata'

import * as express from 'express'

import { SubscriptionInvitesController } from './SubscriptionInvitesController'
import { results } from 'inversify-express-utils'
import { User } from '../Domain/User/User'
import { InviteToSharedSubscription } from '../Domain/UseCase/InviteToSharedSubscription/InviteToSharedSubscription'
import { AcceptSharedSubscriptionInvitation } from '../Domain/UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'
import { DeclineSharedSubscriptionInvitation } from '../Domain/UseCase/DeclineSharedSubscriptionInvitation/DeclineSharedSubscriptionInvitation'
import { CancelSharedSubscriptionInvitation } from '../Domain/UseCase/CancelSharedSubscriptionInvitation/CancelSharedSubscriptionInvitation'
import { RoleName } from '@standardnotes/common'
import { ListSharedSubscriptionInvitations } from '../Domain/UseCase/ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'

describe('SubscriptionInvitesController', () => {
  let inviteToSharedSubscription: InviteToSharedSubscription
  let acceptSharedSubscriptionInvitation: AcceptSharedSubscriptionInvitation
  let declineSharedSubscriptionInvitation: DeclineSharedSubscriptionInvitation
  let cancelSharedSubscriptionInvitation: CancelSharedSubscriptionInvitation
  let listSharedSubscriptionInvitations: ListSharedSubscriptionInvitations

  let request: express.Request
  let response: express.Response
  let user: User

  const createController = () =>
    new SubscriptionInvitesController(
      inviteToSharedSubscription,
      acceptSharedSubscriptionInvitation,
      declineSharedSubscriptionInvitation,
      cancelSharedSubscriptionInvitation,
      listSharedSubscriptionInvitations,
    )

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'
    user.email = 'test@test.te'

    inviteToSharedSubscription = {} as jest.Mocked<InviteToSharedSubscription>
    inviteToSharedSubscription.execute = jest.fn()

    acceptSharedSubscriptionInvitation = {} as jest.Mocked<AcceptSharedSubscriptionInvitation>
    acceptSharedSubscriptionInvitation.execute = jest.fn()

    declineSharedSubscriptionInvitation = {} as jest.Mocked<DeclineSharedSubscriptionInvitation>
    declineSharedSubscriptionInvitation.execute = jest.fn()

    cancelSharedSubscriptionInvitation = {} as jest.Mocked<CancelSharedSubscriptionInvitation>
    cancelSharedSubscriptionInvitation.execute = jest.fn()

    listSharedSubscriptionInvitations = {} as jest.Mocked<ListSharedSubscriptionInvitations>
    listSharedSubscriptionInvitations.execute = jest.fn()

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      email: 'test@test.te',
    }
    response.locals.roles = [
      {
        uuid: '1-2-3',
        name: RoleName.CoreUser,
      },
    ]
  })

  it('should get invitations to subscription sharing', async () => {
    listSharedSubscriptionInvitations.execute = jest.fn().mockReturnValue({
      invitations: [],
    })

    const httpResponse = <results.JsonResult>await createController().listInvites(request, response)
    const result = await httpResponse.executeAsync()

    expect(listSharedSubscriptionInvitations.execute).toHaveBeenCalledWith({
      inviterEmail: 'test@test.te',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should cancel invitation to subscription sharing', async () => {
    request.params.inviteUuid = '1-2-3'

    cancelSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: true,
    })

    const httpResponse = <results.JsonResult>await createController().cancelSubscriptionSharing(request, response)
    const result = await httpResponse.executeAsync()

    expect(cancelSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
      inviterEmail: 'test@test.te',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not cancel invitation to subscription sharing if the workflow fails', async () => {
    request.params.inviteUuid = '1-2-3'

    cancelSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const httpResponse = <results.JsonResult>await createController().cancelSubscriptionSharing(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should decline invitation to subscription sharing', async () => {
    request.params.inviteUuid = '1-2-3'

    declineSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: true,
    })

    const httpResponse = <results.JsonResult>await createController().declineInvite(request)
    const result = await httpResponse.executeAsync()

    expect(declineSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not decline invitation to subscription sharing if the workflow fails', async () => {
    request.params.inviteUuid = '1-2-3'

    declineSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const httpResponse = <results.JsonResult>await createController().declineInvite(request)
    const result = await httpResponse.executeAsync()

    expect(declineSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(result.statusCode).toEqual(400)
  })

  it('should accept invitation to subscription sharing', async () => {
    request.params.inviteUuid = '1-2-3'

    acceptSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: true,
    })

    const httpResponse = <results.JsonResult>await createController().acceptInvite(request)
    const result = await httpResponse.executeAsync()

    expect(acceptSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not accept invitation to subscription sharing if the workflow fails', async () => {
    request.params.inviteUuid = '1-2-3'

    acceptSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const httpResponse = <results.JsonResult>await createController().acceptInvite(request)
    const result = await httpResponse.executeAsync()

    expect(acceptSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(result.statusCode).toEqual(400)
  })

  it('should invite to user subscription', async () => {
    request.body.identifier = 'invitee@test.te'
    response.locals.user = {
      uuid: '1-2-3',
      email: 'test@test.te',
    }

    inviteToSharedSubscription.execute = jest.fn().mockReturnValue({
      success: true,
    })

    const httpResponse = <results.JsonResult>await createController().inviteToSubscriptionSharing(request, response)
    const result = await httpResponse.executeAsync()

    expect(inviteToSharedSubscription.execute).toHaveBeenCalledWith({
      inviterEmail: 'test@test.te',
      inviterUuid: '1-2-3',
      inviteeIdentifier: 'invitee@test.te',
      inviterRoles: ['CORE_USER'],
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not invite to user subscription if the identifier is missing in request', async () => {
    response.locals.user = {
      uuid: '1-2-3',
      email: 'test@test.te',
    }

    const httpResponse = <results.JsonResult>await createController().inviteToSubscriptionSharing(request, response)
    const result = await httpResponse.executeAsync()

    expect(inviteToSharedSubscription.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(400)
  })

  it('should not invite to user subscription if the workflow does not run', async () => {
    request.body.identifier = 'invitee@test.te'
    response.locals.user = {
      uuid: '1-2-3',
      email: 'test@test.te',
    }

    inviteToSharedSubscription.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const httpResponse = <results.JsonResult>await createController().inviteToSubscriptionSharing(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })
})
