import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import { StatisticMeasure } from '../../Statistics/StatisticMeasure'
import { StatisticMeasureName } from '../../Statistics/StatisticMeasureName'
import { StatisticMeasureRepositoryInterface } from '../../Statistics/StatisticMeasureRepositoryInterface'
import { PersistStatisticDTO } from './PersistStatisticDTO'

export class PersistStatistic implements UseCaseInterface<StatisticMeasure> {
  constructor(private statisticMeasureRepository: StatisticMeasureRepositoryInterface) {}

  async execute(dto: PersistStatisticDTO): Promise<Result<StatisticMeasure>> {
    const statisticMeasureNameOrError = StatisticMeasureName.create(dto.statisticMeasureName)
    if (statisticMeasureNameOrError.isFailed()) {
      return Result.fail(`Could not persist statistic measure: ${statisticMeasureNameOrError.getError()}`)
    }

    const statisticMeasureOrError = StatisticMeasure.create({
      date: dto.date,
      name: statisticMeasureNameOrError.getValue(),
      value: dto.value,
    })
    if (statisticMeasureOrError.isFailed()) {
      return Result.fail(`Could not persist statistic measure: ${statisticMeasureOrError.getError()}`)
    }
    const statisticMeasure = statisticMeasureOrError.getValue()

    await this.statisticMeasureRepository.save(statisticMeasure)

    return Result.ok(statisticMeasure)
  }
}
