import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'revisions' })
export class TypeORMRevision {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'item_uuid',
    length: 36,
  })
  @Index('item_uuid')
  declare itemUuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('user_uuid')
  declare userUuid: string

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
  declare contentType: string | null

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
  declare creationDate: Date

  @Column({
    name: 'created_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  declare createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  declare updatedAt: Date
}
