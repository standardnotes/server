import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import TYPES from '../../Bootstrap/Types'

import { InvitationStatus } from '../../Domain/SharedSubscription/InvitationStatus'
import { InviteeIdentifierType } from '../../Domain/SharedSubscription/InviteeIdentifierType'
import { InviterIdentifierType } from '../../Domain/SharedSubscription/InviterIdentifierType'
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

  async updateInviterIdentifierEmail(fromEmail: string, toEmail: string, updatedAt: number): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update(SharedSubscriptionInvitation)
      .set({ inviterIdentifier: toEmail, updatedAt })
      .where('inviter_identifier = :fromEmail AND inviter_identifier_type = :inviterType', {
        fromEmail,
        inviterType: InviterIdentifierType.Email,
      })
      .execute()
  }

  async updateInviteeIdentifierEmail(fromEmail: string, toEmail: string, updatedAt: number): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update(SharedSubscriptionInvitation)
      .set({ inviteeIdentifier: toEmail, updatedAt })
      .where('invitee_identifier = :fromEmail AND invitee_identifier_type = :inviteeType', {
        fromEmail,
        inviteeType: InviteeIdentifierType.Email,
      })
      .execute()
  }
}
