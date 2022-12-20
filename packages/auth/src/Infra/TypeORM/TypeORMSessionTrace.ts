import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'session_traces' })
@Index('user_uuid_and_creation_date', ['userUuid', 'creationDate'], { unique: true })
export class TypeORMSessionTrace {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'username',
    length: 255,
  })
  declare username: string

  @Column({
    name: 'subscription_plan_name',
    length: 64,
    type: 'varchar',
    nullable: true,
  })
  @Index('subscription_plan_name')
  declare subscriptionPlanName: string | null

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  declare createdAt: Date

  @Column({
    name: 'creation_date',
    type: 'date',
  })
  @Index('creation_date')
  declare creationDate: Date

  @Column({
    name: 'expires_at',
    type: 'datetime',
  })
  declare expiresAt: Date
}
