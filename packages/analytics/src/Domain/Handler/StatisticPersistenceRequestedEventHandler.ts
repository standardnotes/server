import { DomainEventHandlerInterface, StatisticPersistenceRequestedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'
import { PersistStatistic } from '../UseCase/PersistStatistic/PersistStatistic'
import { Mixpanel } from 'mixpanel'

export class StatisticPersistenceRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private persistStatistic: PersistStatistic,
    private timer: TimerInterface,
    private logger: Logger,
    private mixpanelClient: Mixpanel | null,
  ) {}

  async handle(event: StatisticPersistenceRequestedEvent): Promise<void> {
    const result = await this.persistStatistic.execute({
      date: this.timer.convertMicrosecondsToDate(event.payload.date),
      statisticMeasureName: event.payload.statisticMeasureName,
      value: event.payload.value,
    })

    if (result.isFailed()) {
      this.logger.error(result.getError())
    }

    if (this.mixpanelClient !== null) {
      this.mixpanelClient.track(event.type, {
        distinct_id: 'global-stats',
        statistic: event.payload.statisticMeasureName,
        value: event.payload.value,
      })
    }
  }
}
