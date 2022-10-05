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

  @ManyToOne(() => User, (user) => user.groups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid' })
  declare user: Promise<User>

  @ManyToOne(() => Group, (group) => group.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_uuid' })
  declare group: Promise<Group>
}
