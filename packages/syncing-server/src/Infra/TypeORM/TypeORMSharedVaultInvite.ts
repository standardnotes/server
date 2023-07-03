import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'shared_vault_invites' })
export class TypeORMSharedVaultInvite {
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
    length: 36,
  })
  declare senderUuid: string

  @Column({
    name: 'encrypted_message',
    type: 'text',
  })
  declare encryptedMessage: string

  @Column({
    name: 'permission',
    type: 'varchar',
    length: 24,
  })
  declare permission: string

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
