import 'reflect-metadata'

import { RevenueModificationRepositoryInterface } from '../../Revenue/RevenueModificationRepositoryInterface'
import { StatisticMeasureName } from '../../Statistics/StatisticMeasureName'
import { StatisticsStoreInterface } from '../../Statistics/StatisticsStoreInterface'
import { Period } from '../../Time/Period'

import { CalculateMonthlyRecurringRevenue } from './CalculateMonthlyRecurringRevenue'

describe('CalculateMonthlyRecurringRevenue', () => {
  let revenueModificationRepository: RevenueModificationRepositoryInterface
  let statisticsStore: StatisticsStoreInterface

  const createUseCase = () => new CalculateMonthlyRecurringRevenue(revenueModificationRepository, statisticsStore)

  beforeEach(() => {
    revenueModificationRepository = {} as jest.Mocked<RevenueModificationRepositoryInterface>
    revenueModificationRepository.sumMRRDiff = jest.fn().mockReturnValue(123.45)

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.setMeasure = jest.fn()
  })

  it('should calculate the MRR diff and persist it as a statistic', async () => {
    await createUseCase().execute({})

    expect(statisticsStore.setMeasure).toHaveBeenCalledWith(StatisticMeasureName.NAMES.MRR, 123.45, [
      Period.Today,
      Period.ThisMonth,
      Period.ThisYear,
    ])
  })
})
