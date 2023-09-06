import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'auth_shared_vault_users' })
export class TypeORMSharedVaultUser {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'shared_vault_uuid',
    length: 36,
  })
  @Index('shared_vault_uuid_on_auth_shared_vault_users')
  declare sharedVaultUuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('user_uuid_on_auth_shared_vault_users')
  declare userUuid: string

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
