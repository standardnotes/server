import { Uuid } from '@standardnotes/domain-core'

import { RevenueModification } from './RevenueModification'

export interface RevenueModificationRepositoryInterface {
  findLastByUserUuid(userUuid: Uuid): Promise<RevenueModification | null>
  sumMRRDiff(dto: { billingFrequencies: number[]; planNames?: string[] }): Promise<number>
  save(revenueModification: RevenueModification): Promise<RevenueModification>
}
