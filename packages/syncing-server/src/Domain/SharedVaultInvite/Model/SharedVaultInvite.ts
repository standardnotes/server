import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
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
    name: 'sender_uuid',
  })
  declare senderUuid: string

  @Column({
    name: 'encrypted_message',
  })
  declare encryptedMessage: string

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
