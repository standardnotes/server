import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../User/User'

@Entity({ name: 'analytics_entities' })
export class AnalyticsEntity {
  @PrimaryGeneratedColumn()
  declare id: number

  @OneToOne(
    /* istanbul ignore next */
    () => User,
    /* istanbul ignore next */
    (user) => user.analyticsEntity,
    /* istanbul ignore next */
    { onDelete: 'CASCADE', nullable: false, lazy: true, eager: false },
  )
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  declare user: Promise<User>
}
