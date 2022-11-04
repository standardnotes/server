import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'analytics_entities' })
export class AnalyticsEntity {
  @PrimaryGeneratedColumn()
  declare id: number

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('user_uuid')
  declare userUuid: string
}
