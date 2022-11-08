import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity({ name: 'revenue_modifications' })
export class TypeORMRevenueModification {
  @PrimaryColumn({
    type: 'uuid',
    length: 36,
  })
  declare uuid: string

  @Column({
    name: 'subscription_id',
  })
  declare subscriptionId: number

  @Column({
    name: 'user_email',
    length: 255,
  })
  @Index('email')
  declare userEmail: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  @Index('user_uuid')
  declare userUuid: string

  @Column({
    name: 'event_type',
  })
  declare eventType: string

  @Column({
    name: 'subscription_plan',
  })
  declare subscriptionPlan: string

  @Column({
    name: 'billing_frequency',
  })
  declare billingFrequency: number

  @Column({
    name: 'new_customer',
  })
  declare isNewCustomer: boolean

  @Column({
    name: 'previous_mrr',
  })
  declare previousMonthlyRevenue: number

  @Column({
    name: 'new_mrr',
  })
  declare newMonthlyRevenue: number
}
