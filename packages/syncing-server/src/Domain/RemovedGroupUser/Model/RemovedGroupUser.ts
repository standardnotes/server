import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'removed_group_users' })
export class RemovedGroupUser {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'group_uuid',
    length: 36,
  })
  declare groupUuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'removed_by',
    length: 36,
  })
  declare removedBy: string

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
