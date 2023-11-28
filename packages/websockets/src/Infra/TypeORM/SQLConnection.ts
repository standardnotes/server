import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'connections' })
export class SQLConnection {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    type: 'varchar',
    length: 36,
  })
  @Index('index_connections_on_user_uuid')
  declare userUuid: string

  @Column({
    name: 'session_uuid',
    type: 'varchar',
    length: 36,
  })
  declare sessionUuid: string

  @Column({
    name: 'connection_id',
    type: 'varchar',
    length: 255,
  })
  @Index('index_connections_on_connection_id', { unique: true })
  declare connectionId: string

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
