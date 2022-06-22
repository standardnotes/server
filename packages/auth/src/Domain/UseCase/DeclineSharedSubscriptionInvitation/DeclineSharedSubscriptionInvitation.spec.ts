import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { SharedSubscriptionInvitation } from '../../SharedSubscription/SharedSubscriptionInvitation'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'

import { DeclineSharedSubscriptionInvitation } from './DeclineSharedSubscriptionInvitation'

describe('DeclineSharedSubscriptionInvitation', () => {
  let sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface
  let timer: TimerInterface
  let invitation: SharedSubscriptionInvitation

  const createUseCase = () => new DeclineSharedSubscriptionInvitation(sharedSubscriptionInvitationRepository, timer)

  beforeEach(() => {
    invitation = {
      subscriptionId: 3,
    } as jest.Mocked<SharedSubscriptionInvitation>

    sharedSubscriptionInvitationRepository = {} as jest.Mocked<SharedSubscriptionInvitationRepositoryInterface>
    sharedSubscriptionInvitationRepository.findOneByUuidAndStatus = jest.fn().mockReturnValue(invitation)
    sharedSubscriptionInvitationRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
  })

  it('should decline the invitation', async () => {
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: true,
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalledWith({
      status: 'declined',
      subscriptionId: 3,
      updatedAt: 1,
    })
  })

  it('should not decline the invitation if it does not exist', async () => {
    sharedSubscriptionInvitationRepository.findOneByUuidAndStatus = jest.fn().mockReturnValue(null)
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
  })
})
