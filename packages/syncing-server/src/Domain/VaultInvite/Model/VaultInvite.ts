import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { VaultInviteType } from './VaultInviteType'
import { VaultUserPermission } from '../../VaultUser/Model/VaultUserPermission'

@Entity({ name: 'vault_invites' })
export class VaultInvite {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'vault_uuid',
    length: 36,
  })
  declare vaultUuid: string

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
  declare inviteType: VaultInviteType

  @Column({
    name: 'inviter_public_key',
  })
  declare inviterPublicKey: string

  @Column({
    name: 'encrypted_vault_data',
  })
  declare encryptedVaultData: string

  @Column({
    name: 'permissions',
  })
  declare permissions: VaultUserPermission

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
