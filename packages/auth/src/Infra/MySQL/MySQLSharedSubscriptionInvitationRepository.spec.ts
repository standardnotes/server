import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'

import { MySQLSharedSubscriptionInvitationRepository } from './MySQLSharedSubscriptionInvitationRepository'
import { SharedSubscriptionInvitation } from '../../Domain/SharedSubscription/SharedSubscriptionInvitation'
import { InvitationStatus } from '../../Domain/SharedSubscription/InvitationStatus'

describe('MySQLSharedSubscriptionInvitationRepository', () => {
  let ormRepository: Repository<SharedSubscriptionInvitation>
  let queryBuilder: SelectQueryBuilder<SharedSubscriptionInvitation>
  let invitation: SharedSubscriptionInvitation

  const createRepository = () => new MySQLSharedSubscriptionInvitationRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<SharedSubscriptionInvitation>>

    invitation = {} as jest.Mocked<SharedSubscriptionInvitation>

    ormRepository = {} as jest.Mocked<Repository<SharedSubscriptionInvitation>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
    ormRepository.save = jest.fn()
  })

  it('should save', async () => {
    await createRepository().save(invitation)

    expect(ormRepository.save).toHaveBeenCalledWith(invitation)
  })

  it('should get invitations by inviter email', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([])

    const result = await createRepository().findByInviterEmail('test@test.te')

    expect(queryBuilder.where).toHaveBeenCalledWith('invitation.inviter_identifier = :inviterEmail', {
      inviterEmail: 'test@test.te',
    })

    expect(result).toEqual([])
  })

  it('should count invitations by inviter email and statuses', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getCount = jest.fn().mockReturnValue(3)

    const result = await createRepository().countByInviterEmailAndStatus('test@test.te', [InvitationStatus.Sent])

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'invitation.inviter_identifier = :inviterEmail AND invitation.status IN (:...statuses)',
      { inviterEmail: 'test@test.te', statuses: ['sent'] },
    )

    expect(result).toEqual(3)
  })

  it('should find one invitation by name and uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(invitation)

    const result = await createRepository().findOneByUuidAndStatus('1-2-3', InvitationStatus.Sent)

    expect(queryBuilder.where).toHaveBeenCalledWith('invitation.uuid = :uuid AND invitation.status = :status', {
      uuid: '1-2-3',
      status: 'sent',
    })

    expect(result).toEqual(invitation)
  })

  it('should find one invitation by invitee and inviter email', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(invitation)

    const result = await createRepository().findOneByInviteeAndInviterEmail('invitee@test.te', 'inviter@test.te')

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'invitation.inviter_identifier = :inviterEmail AND invitation.invitee_identifier = :inviteeEmail',
      {
        inviterEmail: 'inviter@test.te',
        inviteeEmail: 'invitee@test.te',
      },
    )

    expect(result).toEqual(invitation)
  })

  it('should find one invitation by uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(invitation)

    const result = await createRepository().findOneByUuid('1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('invitation.uuid = :uuid', { uuid: '1-2-3' })

    expect(result).toEqual(invitation)
  })
})
