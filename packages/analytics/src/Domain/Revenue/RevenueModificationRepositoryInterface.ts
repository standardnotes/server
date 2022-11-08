import { Uuid } from '../Common/Uuid'
import { RevenueModification } from './RevenueModification'

export interface RevenueModificationRepositoryInterface {
  findLastByUserUuid(userUuid: Uuid): Promise<RevenueModification | null>
  save(revenueModification: RevenueModification): Promise<RevenueModification>
}
