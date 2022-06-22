import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { SubscriptionSetting } from '../Setting/SubscriptionSetting'
import { User } from '../User/User'
import { UserSubscriptionType } from './UserSubscriptionType'

@Entity({ name: 'user_subscriptions' })
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

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
  @Index('updated_at')
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

  @Column({
    name: 'subscription_type',
    length: 24,
    type: 'varchar',
  })
  declare subscriptionType: UserSubscriptionType

  @ManyToOne(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    (user) => user.subscriptions,
    /* istanbul ignore next */
    { onDelete: 'CASCADE', nullable: false, lazy: true, eager: false },
  )
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  declare user: Promise<User>

  @OneToMany(
    /* istanbul ignore next */
    () => SubscriptionSetting,
    /* istanbul ignore next */
    (subscriptionSetting) => subscriptionSetting.userSubscription,
    /* istanbul ignore next */
    { lazy: true, eager: false },
  )
  declare subscriptionSettings: Promise<SubscriptionSetting[]>
}
