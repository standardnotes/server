import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'shared_vault_associations' })
export class TypeORMSharedVaultAssociation {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'shared_vault_uuid',
    length: 36,
  })
  @Index('shared_vault_uuid_on_shared_vault_associations')
  declare sharedVaultUuid: string

  @Column({
    name: 'item_uuid',
    length: 36,
  })
  @Index('item_uuid_on_shared_vault_associations')
  declare itemUuid: string

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
