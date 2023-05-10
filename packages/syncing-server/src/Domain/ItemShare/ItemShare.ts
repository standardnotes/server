import { ContentType } from '@standardnotes/common'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'item_shares' })
@Index('index_item_shares_on_share_token', ['shareToken'])
export class ItemShare {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    type: 'varchar',
    name: 'share_token',
    length: 36,
    nullable: true,
  })
  declare shareToken: string | null

  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  declare contentType: ContentType | null

  @Column({
    name: 'public_key',
    type: 'text',
    nullable: true,
  })
  declare publicKey: string | null

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
  @Index('index_item_shares_on_user_uuid')
  declare userUuid: string

  @Column({
    name: 'item_uuid',
    length: 36,
  })
  @Index('index_item_shares_on_item_uuid')
  declare itemUuid: string

  @Column({
    type: 'tinyint',
    precision: 1,
    nullable: true,
    default: 0,
  })
  declare expired: boolean

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
