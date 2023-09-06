import { BSON } from 'mongodb'
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm'

@Entity({ name: 'revisions' })
export class MongoDBRevision {
  @ObjectIdColumn()
  declare _id: BSON.UUID

  @Column()
  @Index('item_uuid_on_revisions')
  declare itemUuid: string

  @Column()
  @Index('user_uuid_on_revisions')
  declare userUuid: string | null

  @Column()
  declare content: string | null

  @Column()
  declare contentType: string | null

  @Column()
  declare itemsKeyId: string | null

  @Column()
  declare encItemKey: string | null

  @Column()
  declare authHash: string | null

  @Column()
  declare creationDate: Date

  @Column()
  declare createdAt: Date

  @Column()
  declare updatedAt: Date

  @Column()
  declare editedBy: string | null

  @Column()
  @Index('index_revisions_on_shared_vault_uuid')
  declare sharedVaultUuid: string | null

  @Column()
  declare keySystemIdentifier: string | null
}
