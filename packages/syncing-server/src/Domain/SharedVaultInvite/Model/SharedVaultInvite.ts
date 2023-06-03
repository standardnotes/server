import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { SharedVaultInviteType } from './SharedVaultInviteType'
import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'

@Entity({ name: 'shared_vault_invites' })
export class SharedVaultInvite {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'shared_vault_uuid',
    length: 36,
  })
  declare sharedVaultUuid: string

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
  declare inviteType: SharedVaultInviteType

  @Column({
    name: 'inviter_public_key',
  })
  declare inviterPublicKey: string

  @Column({
    name: 'encrypted_vault_key_content',
  })
  declare encryptedVaultKeyContent: string

  @Column({
    name: 'permissions',
  })
  declare permissions: SharedVaultUserPermission

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
