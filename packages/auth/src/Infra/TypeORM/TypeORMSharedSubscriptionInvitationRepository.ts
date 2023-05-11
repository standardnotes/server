import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import TYPES from '../../Bootstrap/Types'

import { InvitationStatus } from '../../Domain/SharedSubscription/InvitationStatus'
import { SharedSubscriptionInvitation } from '../../Domain/SharedSubscription/SharedSubscriptionInvitation'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../Domain/SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'

@injectable()
export class TypeORMSharedSubscriptionInvitationRepository implements SharedSubscriptionInvitationRepositoryInterface {
  constructor(
    @inject(TYPES.Auth_ORMSharedSubscriptionInvitationRepository)
    private ormRepository: Repository<SharedSubscriptionInvitation>,
  ) {}

  async findOneByInviteeAndInviterEmail(
    inviteeEmail: string,
    inviterEmail: string,
  ): Promise<SharedSubscriptionInvitation | null> {
    return this.ormRepository
      .createQueryBuilder('invitation')
      .where('invitation.inviter_identifier = :inviterEmail AND invitation.invitee_identifier = :inviteeEmail', {
        inviterEmail,
        inviteeEmail,
      })
      .getOne()
  }

  async save(sharedSubscriptionInvitation: SharedSubscriptionInvitation): Promise<SharedSubscriptionInvitation> {
    return this.ormRepository.save(sharedSubscriptionInvitation)
  }

  async findByInviterEmail(inviterEmail: string): Promise<SharedSubscriptionInvitation[]> {
    return this.ormRepository
      .createQueryBuilder('invitation')
      .where('invitation.inviter_identifier = :inviterEmail', {
        inviterEmail,
      })
      .getMany()
  }

  async countByInviterEmailAndStatus(inviterEmail: string, statuses: InvitationStatus[]): Promise<number> {
    return this.ormRepository
      .createQueryBuilder('invitation')
      .where('invitation.inviter_identifier = :inviterEmail AND invitation.status IN (:...statuses)', {
        inviterEmail,
        statuses,
      })
      .getCount()
  }

  async findOneByUuid(uuid: string): Promise<SharedSubscriptionInvitation | null> {
    return this.ormRepository
      .createQueryBuilder('invitation')
      .where('invitation.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async findOneByUuidAndStatus(uuid: string, status: InvitationStatus): Promise<SharedSubscriptionInvitation | null> {
    return this.ormRepository
      .createQueryBuilder('invitation')
      .where('invitation.uuid = :uuid AND invitation.status = :status', {
        uuid,
        status,
      })
      .getOne()
  }
}
