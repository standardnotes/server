import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'shared_vault_items' })
export class TypeORMSharedVaultItem {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'shared_vault_uuid',
    length: 36,
  })
  declare sharedVaultUuid: string

  @Column({
    name: 'item_uuid',
    length: 36,
  })
  declare itemUuid: string

  @Column({
    name: 'key_system_identifier',
    type: 'varchar',
    length: 36,
  })
  declare keySystemIdentifier: string

  @Column({
    name: 'last_edited_by',
    type: 'varchar',
    length: 36,
  })
  declare lastEditedBy: string

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
