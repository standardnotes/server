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
}
