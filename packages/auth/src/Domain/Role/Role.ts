import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Permission } from '../Permission/Permission'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { User } from '../User/User'

@Entity({ name: 'roles' })
@Index('name_and_version', ['name', 'version'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    length: 255,
  })
  declare name: string

  @Column({
    type: 'smallint',
  })
  declare version: number

  @Column({
    name: 'created_at',
    type: 'datetime',
    default:
      /* istanbul ignore next */
      () => 'CURRENT_TIMESTAMP',
  })
  declare createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default:
      /* istanbul ignore next */
      () => 'CURRENT_TIMESTAMP',
  })
  declare updatedAt: Date

  @ManyToMany(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    { lazy: true, eager: false },
  )
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'role_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'user_uuid',
      referencedColumnName: 'uuid',
    },
  })
  declare users: Promise<Array<User>>

  @ManyToMany(
    /* istanbul ignore next */
    () => Permission,
    /* istanbul ignore next */
    { lazy: true, eager: false },
  )
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'permission_uuid',
      referencedColumnName: 'uuid',
    },
  })
  declare permissions: Promise<Array<Permission>>

  @ManyToMany(
    /* istanbul ignore next */
    () => OfflineUserSubscription,
    /* istanbul ignore next */
    { lazy: true, eager: false },
  )
  @JoinTable({
    name: 'offline_user_roles',
    joinColumn: {
      name: 'role_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'offline_user_subscription_uuid',
      referencedColumnName: 'uuid',
    },
  })
  declare offlineUserSubscriptions: Promise<Array<OfflineUserSubscription>>
}
