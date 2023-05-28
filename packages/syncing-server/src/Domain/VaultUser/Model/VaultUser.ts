import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { VaultUserPermission } from './VaultUserPermission'

@Entity({ name: 'vault_users' })
export class VaultUser {
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
