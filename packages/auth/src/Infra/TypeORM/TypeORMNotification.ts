import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'notifications' })
export class TypeORMNotification {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('index_notifications_on_user_uuid')
  declare userUuid: string

  @Column({
    name: 'type',
    length: 36,
  })
  declare type: string

  @Column({
    name: 'payload',
    type: 'text',
  })
  declare payload: string

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
