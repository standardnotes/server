import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Role } from '../Role/Role'

@Entity({ name: 'offline_user_subscriptions' })
export class OfflineUserSubscription {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    length: 255,
  })
  @Index('email')
  declare email: string

  @Column({
    name: 'plan_name',
    length: 255,
    nullable: false,
  })
  declare planName: string

  @Column({
    name: 'ends_at',
    type: 'bigint',
  })
  declare endsAt: number

  @Column({
    name: 'created_at',
    type: 'bigint',
  })
  declare createdAt: number

  @Column({
    name: 'updated_at',
    type: 'bigint',
  })
  declare updatedAt: number

  @Column({
    type: 'tinyint',
    width: 1,
    nullable: false,
    default: 0,
  })
  declare cancelled: boolean

  @Column({
    name: 'subscription_id',
    type: 'int',
    width: 11,
    nullable: true,
  })
  declare subscriptionId: number | null

  @ManyToMany(
    /* istanbul ignore next */
    () => Role,
    /* istanbul ignore next */
    { lazy: true, eager: false },
  )
  @JoinTable({
    name: 'offline_user_roles',
    joinColumn: {
      name: 'offline_user_subscription_uuid',
      referencedColumnName: 'uuid',
    },
    inverseJoinColumn: {
      name: 'role_uuid',
      referencedColumnName: 'uuid',
    },
  })
  declare roles: Promise<Array<Role>>
}
