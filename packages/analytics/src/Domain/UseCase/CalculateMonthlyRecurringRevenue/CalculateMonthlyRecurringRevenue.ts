import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { Result } from '../../Core/Result'
import { MonthlyRevenue } from '../../Revenue/MonthlyRevenue'
import { RevenueModificationRepositoryInterface } from '../../Revenue/RevenueModificationRepositoryInterface'
import { StatisticsMeasure } from '../../Statistics/StatisticsMeasure'
import { StatisticsStoreInterface } from '../../Statistics/StatisticsStoreInterface'
import { Period } from '../../Time/Period'
import { DomainUseCaseInterface } from '../DomainUseCaseInterface'
import { CalculateMonthlyRecurringRevenueDTO } from './CalculateMonthlyRecurringRevenueDTO'

@injectable()
export class CalculateMonthlyRecurringRevenue implements DomainUseCaseInterface<MonthlyRevenue> {
  constructor(
    @inject(TYPES.RevenueModificationRepository)
    private revenueModificationRepository: RevenueModificationRepositoryInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
  ) {}

  async execute(_dto: CalculateMonthlyRecurringRevenueDTO): Promise<Result<MonthlyRevenue>> {
    const mrrDiff = await this.revenueModificationRepository.sumMRRDiff()

    await this.statisticsStore.setMeasure(StatisticsMeasure.MRR, mrrDiff, [
      Period.Today,
      Period.ThisMonth,
      Period.ThisYear,
    ])

    return MonthlyRevenue.create(mrrDiff)
  }
}
