import 'reflect-metadata'

import { SubscriptionInvitesController } from './SubscriptionInvitesController'
import { User } from '../Domain/User/User'
import { InviteToSharedSubscription } from '../Domain/UseCase/InviteToSharedSubscription/InviteToSharedSubscription'
import { AcceptSharedSubscriptionInvitation } from '../Domain/UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'
import { DeclineSharedSubscriptionInvitation } from '../Domain/UseCase/DeclineSharedSubscriptionInvitation/DeclineSharedSubscriptionInvitation'
import { CancelSharedSubscriptionInvitation } from '../Domain/UseCase/CancelSharedSubscriptionInvitation/CancelSharedSubscriptionInvitation'
import { ListSharedSubscriptionInvitations } from '../Domain/UseCase/ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'
import { ApiVersion } from '../Domain/Api/ApiVersion'

describe('SubscriptionInvitesController', () => {
  let inviteToSharedSubscription: InviteToSharedSubscription
  let acceptSharedSubscriptionInvitation: AcceptSharedSubscriptionInvitation
  let declineSharedSubscriptionInvitation: DeclineSharedSubscriptionInvitation
  let cancelSharedSubscriptionInvitation: CancelSharedSubscriptionInvitation
  let listSharedSubscriptionInvitations: ListSharedSubscriptionInvitations

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
  })

  it('should get invitations to subscription sharing', async () => {
    listSharedSubscriptionInvitations.execute = jest.fn().mockReturnValue({
      invitations: [],
    })

    const result = await createController().listInvites({ api: ApiVersion.v20200115, inviterEmail: 'test@test.te' })

    expect(listSharedSubscriptionInvitations.execute).toHaveBeenCalledWith({
      inviterEmail: 'test@test.te',
    })

    expect(result.status).toEqual(200)
  })

  it('should cancel invitation to subscription sharing', async () => {
    cancelSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: true,
    })

    const result = await createController().cancelInvite({
      api: ApiVersion.v20200115,
      inviteUuid: '1-2-3',
      inviterEmail: 'test@test.te',
    })

    expect(cancelSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
      inviterEmail: 'test@test.te',
    })

    expect(result.status).toEqual(200)
  })

  it('should not cancel invitation to subscription sharing if the workflow fails', async () => {
    cancelSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const result = await createController().cancelInvite({
      api: ApiVersion.v20200115,
      inviteUuid: '1-2-3',
    })

    expect(result.status).toEqual(400)
  })

  it('should decline invitation to subscription sharing', async () => {
    declineSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: true,
    })

    const result = await createController().declineInvite({
      api: ApiVersion.v20200115,
      inviteUuid: '1-2-3',
    })

    expect(declineSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(result.status).toEqual(200)
  })

  it('should not decline invitation to subscription sharing if the workflow fails', async () => {
    declineSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const result = await createController().declineInvite({
      api: ApiVersion.v20200115,
      inviteUuid: '1-2-3',
    })

    expect(declineSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(result.status).toEqual(400)
  })

  it('should accept invitation to subscription sharing', async () => {
    acceptSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: true,
    })

    const result = await createController().acceptInvite({
      api: ApiVersion.v20200115,
      inviteUuid: '1-2-3',
    })

    expect(acceptSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(result.status).toEqual(200)
  })

  it('should not accept invitation to subscription sharing if the workflow fails', async () => {
    acceptSharedSubscriptionInvitation.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const result = await createController().acceptInvite({
      api: ApiVersion.v20200115,
      inviteUuid: '1-2-3',
    })

    expect(acceptSharedSubscriptionInvitation.execute).toHaveBeenCalledWith({
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(result.status).toEqual(400)
  })

  it('should invite to user subscription', async () => {
    inviteToSharedSubscription.execute = jest.fn().mockReturnValue({
      success: true,
    })

    const result = await createController().invite({
      api: ApiVersion.v20200115,
      identifier: 'invitee@test.te',
      inviterUuid: '1-2-3',
      inviterEmail: 'test@test.te',
      inviterRoles: ['CORE_USER'],
    })

    expect(inviteToSharedSubscription.execute).toHaveBeenCalledWith({
      inviterEmail: 'test@test.te',
      inviterUuid: '1-2-3',
      inviteeIdentifier: 'invitee@test.te',
      inviterRoles: ['CORE_USER'],
    })

    expect(result.status).toEqual(200)
  })

  it('should not invite to user subscription if the identifier is missing in request', async () => {
    const result = await createController().invite({
      api: ApiVersion.v20200115,
      identifier: '',
      inviterUuid: '1-2-3',
      inviterEmail: 'test@test.te',
      inviterRoles: ['CORE_USER'],
    })

    expect(inviteToSharedSubscription.execute).not.toHaveBeenCalled()

    expect(result.status).toEqual(400)
  })

  it('should not invite to user subscription if the workflow does not run', async () => {
    inviteToSharedSubscription.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const result = await createController().invite({
      api: ApiVersion.v20200115,
      identifier: 'invitee@test.te',
      inviterUuid: '1-2-3',
      inviterEmail: 'test@test.te',
      inviterRoles: ['CORE_USER'],
    })

    expect(result.status).toEqual(400)
  })
})
