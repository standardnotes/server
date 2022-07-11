import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_identifier',
    length: 255,
  })
  @Index('index_events_on_user_identifier')
  declare userIdentifier: string

  @Column({
    name: 'user_identifier_type',
    length: 255,
  })
  declare userIdentifierType: string

  @Column({
    name: 'event_type',
    length: 255,
  })
  declare eventType: string

  @Column({
    name: 'event_payload',
    type: 'text',
  })
  declare eventPayload: string

  @Column({
    name: 'timestamp',
    type: 'bigint',
  })
  declare timestamp: number
}
