import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { GroupUserPermission } from './GroupUserPermission'

@Entity({ name: 'group_users' })
export class GroupUser {
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
    name: 'permissions',
  })
  declare permissions: GroupUserPermission

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
