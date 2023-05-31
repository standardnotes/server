import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { GroupInviteType } from './GroupInviteType'
import { GroupUserPermission } from '../../GroupUser/Model/GroupUserPermission'

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
  declare inviteType: GroupInviteType

  @Column({
    name: 'inviter_public_key',
  })
  declare inviterPublicKey: string

  @Column({
    name: 'encrypted_group_data',
  })
  declare encryptedGroupData: string

  @Column({
    name: 'permissions',
  })
  declare permissions: GroupUserPermission

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
