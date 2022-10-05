import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../User/User'
import { Group } from './Group'
import { GroupAccessLevel } from './GroupAccessLevel'

@Entity({ name: 'group_users' })
@Index('index_group_users_on_group_and_user', ['userUuid', 'groupUuid'], { unique: true })
export class GroupUser {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'access_level',
    length: 64,
  })
  declare accessLevel: GroupAccessLevel

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'group_uuid',
    length: 36,
  })
  declare groupUuid: string

  @Column({
    name: 'encrypted_group_key',
    length: 255,
    type: 'varchar',
  })
  declare encryptedGroupKey: string

  @ManyToOne(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    (user) => user.groups,
    /* istanbul ignore next */
    { onDelete: 'CASCADE' },
  )
  @JoinColumn(
    /* istanbul ignore next */
    { name: 'user_uuid' },
  )
  declare user: Promise<User>

  @ManyToOne(
    /* istanbul ignore next */
    () => Group,
    /* istanbul ignore next */
    (group) => group.users,
    /* istanbul ignore next */
    { onDelete: 'CASCADE' },
  )
  @JoinColumn(
    /* istanbul ignore next */
    { name: 'group_uuid' },
  )
  declare group: Promise<Group>
}
