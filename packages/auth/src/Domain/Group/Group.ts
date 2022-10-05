import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../User/User'
import { GroupType } from './GroupType'
import { GroupUser } from './GroupUser'

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    length: 64,
  })
  declare type: GroupType

  @OneToMany(() => GroupUser, (groupUser) => groupUser.group)
  declare users: Promise<User[]>
}
