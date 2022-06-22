import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { InviteeIdentifierType } from './InviteeIdentifierType'
import { InviterIdentifierType } from './InviterIdentifierType'
import { InvitationStatus } from './InvitationStatus'

@Entity({ name: 'shared_subscription_invitations' })
@Index('invitee_and_status', ['inviteeIdentifier', 'status'])
export class SharedSubscriptionInvitation {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    length: 255,
    type: 'varchar',
    name: 'inviter_identifier',
  })
  @Index('inviter_identifier')
  declare inviterIdentifier: string

  @Column({
    length: 24,
    type: 'varchar',
    name: 'inviter_identifier_type',
  })
  declare inviterIdentifierType: InviterIdentifierType

  @Column({
    length: 255,
    type: 'varchar',
    name: 'invitee_identifier',
  })
  @Index('invitee_identifier')
  declare inviteeIdentifier: string

  @Column({
    length: 24,
    type: 'varchar',
    name: 'invitee_identifier_type',
  })
  declare inviteeIdentifierType: InviteeIdentifierType

  @Column({
    length: 255,
    type: 'varchar',
  })
  declare status: InvitationStatus

  @Column({
    name: 'subscription_id',
    type: 'int',
    width: 11,
  })
  declare subscriptionId: number

  @Column({
    name: 'created_at',
    type: 'bigint',
  })
  declare createdAt: number

  @Column({
    name: 'updated_at',
    type: 'bigint',
  })
  declare updatedAt: number
}
