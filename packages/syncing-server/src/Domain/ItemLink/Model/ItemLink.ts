import { ContentType } from '@standardnotes/common'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'item_links' })
@Index('index_item_links_on_share_token', ['shareToken'])
export class ItemLink {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    type: 'varchar',
    name: 'share_token',
    length: 36,
    nullable: false,
  })
  declare shareToken: string

  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  declare contentType: ContentType | null

  @Column({
    name: 'encrypted_content_key',
    type: 'text',
    nullable: true,
  })
  declare encryptedContentKey: string | null

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('index_item_links_on_user_uuid')
  declare userUuid: string

  @Column({
    name: 'item_uuid',
    length: 36,
  })
  @Index('index_item_links_on_item_uuid')
  declare itemUuid: string

  @Column({
    name: 'file_remote_identifier',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  declare fileRemoteIdentifier: string | null

  @Column({
    name: 'duration',
    type: 'varchar',
    length: 255,
  })
  declare duration: string

  @Column({
    type: 'tinyint',
    precision: 1,
    nullable: true,
    default: 0,
  })
  declare consumed: boolean

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
