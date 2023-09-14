import { BSON } from 'mongodb'
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm'

@Entity({ name: 'items' })
@Index('index_items_on_user_uuid_and_content_type', ['userUuid', 'contentType'])
@Index('user_uuid_and_deleted', ['userUuid', 'deleted'])
export class MongoDBItem {
  @ObjectIdColumn()
  declare _id: BSON.UUID

  @Column()
  declare duplicateOf: string | null

  @Column()
  declare itemsKeyId: string | null

  @Column()
  declare content: string | null

  @Column()
  declare contentType: string | null

  @Column()
  declare contentSize: number | null

  @Column()
  declare encItemKey: string | null

  @Column()
  declare authHash: string | null

  @Column()
  @Index('index_items_on_user_uuid')
  declare userUuid: string

  @Column()
  @Index('index_items_on_deleted')
  declare deleted: boolean

  @Column()
  declare createdAt: Date

  @Column()
  declare updatedAt: Date

  @Column()
  declare createdAtTimestamp: number

  @Column()
  @Index('updated_at_timestamp')
  declare updatedAtTimestamp: number

  @Column()
  declare updatedWithSession: string | null

  @Column()
  declare lastEditedBy: string | null

  @Column()
  @Index('index_items_on_shared_vault_uuid')
  declare sharedVaultUuid: string | null

  @Column()
  declare keySystemIdentifier: string | null
}
