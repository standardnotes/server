import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { UserEventType } from './UserEventType'

@Entity({ name: 'user_events' })
export class UserEvent {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('index_user_events_on_user_uuid')
  declare userUuid: string

  @Column({
    name: 'event_type',
    length: 36,
  })
  declare eventType: UserEventType

  @Column({
    name: 'event_payload',
    type: 'text',
  })
  declare eventPayload: string

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
