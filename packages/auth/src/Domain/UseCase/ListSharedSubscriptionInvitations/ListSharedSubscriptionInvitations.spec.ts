import 'reflect-metadata'

import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'

import { ListSharedSubscriptionInvitations } from './ListSharedSubscriptionInvitations'

describe('ListSharedSubscriptionInvitations', () => {
  let sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface

  const createUseCase = () => new ListSharedSubscriptionInvitations(sharedSubscriptionInvitationRepository)

  beforeEach(() => {
    sharedSubscriptionInvitationRepository = {} as jest.Mocked<SharedSubscriptionInvitationRepositoryInterface>
    sharedSubscriptionInvitationRepository.findByInviterEmail = jest.fn().mockReturnValue([])
  })

  it('should find all invitations made by inviter', async () => {
    expect(await createUseCase().execute({ inviterEmail: 'test@test.te' })).toEqual({ invitations: [] })

    expect(sharedSubscriptionInvitationRepository.findByInviterEmail).toHaveBeenCalledWith('test@test.te')
  })
})
