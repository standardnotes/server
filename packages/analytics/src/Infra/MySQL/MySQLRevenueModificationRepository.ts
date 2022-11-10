import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { Uuid } from '../../Domain/Common/Uuid'
import { MapInterface } from '../../Domain/Map/MapInterface'
import { RevenueModification } from '../../Domain/Revenue/RevenueModification'
import { RevenueModificationRepositoryInterface } from '../../Domain/Revenue/RevenueModificationRepositoryInterface'
import { TypeORMRevenueModification } from '../TypeORM/TypeORMRevenueModification'

@injectable()
export class MySQLRevenueModificationRepository implements RevenueModificationRepositoryInterface {
  constructor(
    @inject(TYPES.ORMRevenueModificationRepository)
    private ormRepository: Repository<TypeORMRevenueModification>,
    @inject(TYPES.RevenueModificationMap)
    private revenueModificationMap: MapInterface<RevenueModification, TypeORMRevenueModification>,
  ) {}

  async sumMRRDiff(dto: { planName?: string; billingFrequency?: number }): Promise<number> {
    const query = this.ormRepository.createQueryBuilder().select('sum(new_mrr - previous_mrr)', 'mrrDiff')

    if (dto.planName !== undefined) {
      query.where('subscription_plan = :planName', { planName: dto.planName })
    }
    if (dto.billingFrequency !== undefined) {
      query.where('billing_frequency = :billingFrequency', { billingFrequency: dto.billingFrequency })
    }

    const result = await query.getRawOne()

    if (result === undefined) {
      return 0
    }

    return +(+result.mrrDiff).toFixed(2)
  }

  async findLastByUserUuid(userUuid: Uuid): Promise<RevenueModification | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :userUuid', { userUuid: userUuid.value })
      .orderBy('created_at', 'DESC')
      .limit(1)
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.revenueModificationMap.toDomain(persistence)
  }

  async save(revenueModification: RevenueModification): Promise<RevenueModification> {
    let persistence = this.revenueModificationMap.toPersistence(revenueModification)

    persistence = await this.ormRepository.save(persistence)

    return this.revenueModificationMap.toDomain(persistence)
  }
}
