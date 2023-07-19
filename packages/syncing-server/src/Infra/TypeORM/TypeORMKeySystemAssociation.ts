import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'key_system_associations' })
export class TypeORMKeySystemAssociation {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'key_system_identifier',
    length: 36,
  })
  @Index('key_system_identifier_on_key_system_associations')
  declare keySystemIdentifier: string

  @Column({
    name: 'item_uuid',
    length: 36,
  })
  @Index('item_uuid_on_key_system_associations')
  declare itemUuid: string

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
