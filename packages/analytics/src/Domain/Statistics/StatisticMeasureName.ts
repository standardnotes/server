import { ValueObject, Result } from '@standardnotes/domain-core'

import { StatisticMeasureNameProps } from './StatisticMeasureNameProps'

export class StatisticMeasureName extends ValueObject<StatisticMeasureNameProps> {
  static readonly NAMES = {
    Income: 'income',
    PlusSubscriptionInitialMonthlyPaymentsIncome: 'plus-subscription-initial-monthly-payments-income',
    ProSubscriptionInitialMonthlyPaymentsIncome: 'pro-subscription-initial-monthly-payments-income',
    PlusSubscriptionInitialAnnualPaymentsIncome: 'plus-subscription-initial-annual-payments-income',
    ProSubscriptionInitialAnnualPaymentsIncome: 'pro-subscription-initial-annual-payments-income',
    PlusSubscriptionRenewingMonthlyPaymentsIncome: 'plus-subscription-renewing-monthly-payments-income',
    ProSubscriptionRenewingMonthlyPaymentsIncome: 'pro-subscription-renewing-monthly-payments-income',
    PlusSubscriptionRenewingAnnualPaymentsIncome: 'plus-subscription-renewing-annual-payments-income',
    ProSubscriptionRenewingAnnualPaymentsIncome: 'pro-subscription-renewing-annual-payments-income',
    SubscriptionLength: 'subscription-length',
    RegistrationLength: 'registration-length',
    RegistrationToSubscriptionTime: 'registration-to-subscription-time',
    RemainingSubscriptionTimePercentage: 'remaining-subscription-time-percentage',
    Refunds: 'refunds',
    NewCustomers: 'new-customers',
    TotalCustomers: 'total-customers',
    MRR: 'mrr',
    MonthlyPlansMRR: 'monthly-plans-mrr',
    AnnualPlansMRR: 'annual-plans-mrr',
    FiveYearPlansMRR: 'five-year-plans-mrr',
    ProPlansMRR: 'pro-plans-mrr',
    PlusPlansMRR: 'plus-plans-mrr',
    ActiveUsers: 'active-users',
    ActiveProUsers: 'active-pro-users',
    ActivePlusUsers: 'active-plus-users',
    ActiveFreeUsers: 'active-free-users',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: StatisticMeasureNameProps) {
    super(props)
  }

  static create(name: string): Result<StatisticMeasureName> {
    const isValidName = Object.values(this.NAMES).includes(name)
    if (!isValidName) {
      return Result.fail<StatisticMeasureName>(`Invalid statistics measure name: ${name}`)
    } else {
      return Result.ok<StatisticMeasureName>(new StatisticMeasureName({ value: name }))
    }
  }
}
