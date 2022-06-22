import { ContentType } from '@standardnotes/common'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Item } from '../Item/Item'

@Entity({ name: 'revisions' })
export class Revision {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @ManyToOne(
    /* istanbul ignore next */
    () => Item,
    /* istanbul ignore next */
    (item) => item.revisions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'item_uuid', referencedColumnName: 'uuid' })
  declare item: Promise<Item>

  @Column({
    type: 'mediumtext',
    nullable: true,
  })
  declare content: string | null

  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  declare contentType: ContentType | null

  @Column({
    type: 'varchar',
    name: 'items_key_id',
    length: 255,
    nullable: true,
  })
  declare itemsKeyId: string | null

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
    name: 'creation_date',
    type: 'date',
    nullable: true,
  })
  @Index('index_revisions_on_creation_date')
  declare creationDate: Date

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  @Index('index_revisions_on_created_at')
  declare createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  declare updatedAt: Date
}
