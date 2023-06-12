import { ContentType } from '@standardnotes/common'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'items' })
@Index('index_items_on_user_uuid_and_content_type', ['userUuid', 'contentType'])
@Index('user_uuid_and_updated_at_timestamp_and_created_at_timestamp', [
  'userUuid',
  'updatedAtTimestamp',
  'createdAtTimestamp',
])
@Index('user_uuid_and_deleted', ['userUuid', 'deleted'])
export class Item {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    type: 'varchar',
    name: 'duplicate_of',
    length: 36,
    nullable: true,
  })
  declare duplicateOf: string | null

  @Column({
    type: 'varchar',
    name: 'items_key_id',
    length: 255,
    nullable: true,
  })
  declare itemsKeyId: string | null

  @Column({
    type: 'text',
    nullable: true,
  })
  declare content: string | null

  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Index('index_items_on_content_type')
  declare contentType: ContentType | null

  @Column({
    name: 'content_size',
    type: 'int',
    nullable: true,
  })
  declare contentSize: number | null

  @Column({
    name: 'enc_item_key',
    type: 'text',
    nullable: true,
  })
  declare encItemKey: string | null

  @Column({
    name: 'auth_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  declare authHash: string | null

  @Column({
    name: 'user_uuid',
    length: 36,
    type: 'varchar',
  })
  @Index('index_items_on_user_uuid')
  declare userUuid: string

  @Column({
    type: 'tinyint',
    precision: 1,
    nullable: true,
    default: 0,
  })
  @Index('index_items_on_deleted')
  declare deleted: boolean

  @Column({
    type: 'varchar',
    name: 'key_system_identifier',
    length: 255,
    nullable: true,
  })
  declare keySystemIdentifier: string | null

  @Column({
    type: 'varchar',
    name: 'shared_vault_uuid',
    length: 255,
    nullable: true,
  })
  declare sharedVaultUuid: string | null

  @Column({
    type: 'varchar',
    name: 'last_edited_by_uuid',
    length: 36,
    nullable: true,
  })
  declare lastEditedByUuid: string | null

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 6,
  })
  declare createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
    precision: 6,
  })
  declare updatedAt: Date

  @Column({
    name: 'created_at_timestamp',
    type: 'bigint',
  })
  declare createdAtTimestamp: number

  @Column({
    name: 'updated_at_timestamp',
    type: 'bigint',
  })
  @Index('updated_at_timestamp')
  declare updatedAtTimestamp: number

  @Column({
    name: 'updated_with_session',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  declare updatedWithSession: string | null
}
