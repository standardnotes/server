import 'reflect-metadata'

import { SharedSubscriptionInvitationCreatedEvent } from '@standardnotes/domain-events'

import { InviteeIdentifierType } from '../SharedSubscription/InviteeIdentifierType'
import { AcceptSharedSubscriptionInvitation } from '../UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'

import { SharedSubscriptionInvitationCreatedEventHandler } from './SharedSubscriptionInvitationCreatedEventHandler'

describe('SharedSubscriptionInvitationCreatedEventHandler', () => {
  let acceptSharedSubscriptionInvitation: AcceptSharedSubscriptionInvitation

  const createHandler = () => new SharedSubscriptionInvitationCreatedEventHandler(acceptSharedSubscriptionInvitation)

  beforeEach(() => {
    acceptSharedSubscriptionInvitation = {} as jest.Mocked<AcceptSharedSubscriptionInvitation>
    acceptSharedSubscriptionInvitation.execute = jest.fn()
  })

  it('should accept automatically invitation for hash invitees', async () => {
    const event = {
      payload: {
        inviteeIdentifierType: InviteeIdentifierType.Hash,
        sharedSubscriptionInvitationUuid: '1-2-3',
      },
    } as jest.Mocked<SharedSubscriptionInvitationCreatedEvent>

    await createHandler().handle(event)

    expect(acceptSharedSubscriptionInvitation.execute).toHaveBeenCalled()
  })

  it('should not accept automatically invitation for email invitees', async () => {
    const event = {
      payload: {
        inviteeIdentifierType: InviteeIdentifierType.Email,
        sharedSubscriptionInvitationUuid: '1-2-3',
      },
    } as jest.Mocked<SharedSubscriptionInvitationCreatedEvent>

    await createHandler().handle(event)

    expect(acceptSharedSubscriptionInvitation.execute).not.toHaveBeenCalled()
  })
})
