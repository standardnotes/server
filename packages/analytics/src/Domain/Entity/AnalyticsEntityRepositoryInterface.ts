import { Uuid } from '@standardnotes/common'
import { AnalyticsEntity } from './AnalyticsEntity'

export interface AnalyticsEntityRepositoryInterface {
  save(analyticsEntity: AnalyticsEntity): Promise<AnalyticsEntity>
  remove(analyticsEntity: AnalyticsEntity): Promise<void>
  findOneByUserUuid(userUuid: Uuid): Promise<AnalyticsEntity | null>
  findOneByUserEmail(email: string): Promise<AnalyticsEntity | null>
}
