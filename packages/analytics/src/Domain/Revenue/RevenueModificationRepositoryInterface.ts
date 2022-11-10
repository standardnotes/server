import { Uuid } from '../Common/Uuid'
import { RevenueModification } from './RevenueModification'

export interface RevenueModificationRepositoryInterface {
  findLastByUserUuid(userUuid: Uuid): Promise<RevenueModification | null>
  sumMRRDiff(dto: { planName?: string; billingFrequency?: number }): Promise<number>
  save(revenueModification: RevenueModification): Promise<RevenueModification>
}
