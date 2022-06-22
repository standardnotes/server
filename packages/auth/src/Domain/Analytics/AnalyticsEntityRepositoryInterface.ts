import { Uuid } from '@standardnotes/common'
import { AnalyticsEntity } from './AnalyticsEntity'

export interface AnalyticsEntityRepositoryInterface {
  save(analyticsEntity: AnalyticsEntity): Promise<AnalyticsEntity>
  findOneByUserUuid(userUuid: Uuid): Promise<AnalyticsEntity | null>
}
