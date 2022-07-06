import { DomainEventInterface } from './DomainEventInterface'
import { DailyAnalyticsReportGeneratedEventPayload } from './DailyAnalyticsReportGeneratedEventPayload'

export interface DailyAnalyticsReportGeneratedEvent extends DomainEventInterface {
  type: 'DAILY_ANALYTICS_REPORT_GENERATED'
  payload: DailyAnalyticsReportGeneratedEventPayload
}
