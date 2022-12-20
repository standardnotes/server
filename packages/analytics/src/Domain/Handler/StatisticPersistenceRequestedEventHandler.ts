import { DomainEventHandlerInterface, StatisticPersistenceRequestedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'
import { PersistStatistic } from '../UseCase/PersistStatistic/PersistStatistic'

export class StatisticPersistenceRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(private persistStatistic: PersistStatistic, private timer: TimerInterface, private logger: Logger) {}

  async handle(event: StatisticPersistenceRequestedEvent): Promise<void> {
    const result = await this.persistStatistic.execute({
      date: this.timer.convertMicrosecondsToDate(event.payload.date),
      statisticMeasureName: event.payload.statisticMeasureName,
      value: event.payload.value,
    })

    if (result.isFailed()) {
      this.logger.error(result.getError())
    }
  }
}
