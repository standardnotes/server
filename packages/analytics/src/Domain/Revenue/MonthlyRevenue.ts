import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { MonthlyRevenueProps } from './MonthlyRevenueProps'

export class MonthlyRevenue extends ValueObject<MonthlyRevenueProps> {
  get value(): number {
    return this.props.value
  }

  private constructor(props: MonthlyRevenueProps) {
    super(props)
  }

  static create(revenue: number): Result<MonthlyRevenue> {
    if (isNaN(revenue) || revenue < 0) {
      return Result.fail<MonthlyRevenue>('Monthly revenue must be a non-negative number')
    } else {
      return Result.ok<MonthlyRevenue>(new MonthlyRevenue({ value: revenue }))
    }
  }
}
