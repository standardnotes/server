import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'group_invites' })
export class GroupInvite {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'group_uuid',
    length: 36,
  })
  declare groupUuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'inviter_uuid',
  })
  declare inviterUuid: string

  @Column({
    name: 'invite_type',
  })
  declare inviteType: 'join' | 'key-change'

  @Column({
    name: 'inviter_public_key',
  })
  declare inviterPublicKey: string

  @Column({
    name: 'encrypted_group_key',
  })
  declare encryptedGroupKey: string

  @Column({
    name: 'created_at_timestamp',
    type: 'bigint',
  })
  declare createdAtTimestamp: number

  @Column({
    name: 'updated_at_timestamp',
    type: 'bigint',
  })
  declare updatedAtTimestamp: number
}
