import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'shared_vault_users' })
export class TypeORMSharedVaultUser {
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
