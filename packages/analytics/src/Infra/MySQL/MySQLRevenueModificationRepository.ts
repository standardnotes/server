import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import TYPES from '../../Bootstrap/Types'
import { RevenueModification } from '../../Domain/Revenue/RevenueModification'
import { RevenueModificationRepositoryInterface } from '../../Domain/Revenue/RevenueModificationRepositoryInterface'
import { TypeORMRevenueModification } from '../TypeORM/TypeORMRevenueModification'

@injectable()
export class MySQLRevenueModificationRepository implements RevenueModificationRepositoryInterface {
  constructor(
    @inject(TYPES.ORMRevenueModificationRepository)
    private ormRepository: Repository<TypeORMRevenueModification>,
    @inject(TYPES.RevenueModificationMap)
    private revenueModificationMap: MapperInterface<RevenueModification, TypeORMRevenueModification>,
  ) {}

  async sumMRRDiff(dto: { billingFrequencies: number[]; planNames?: string[] }): Promise<number> {
    const query = this.ormRepository.createQueryBuilder().select('sum(new_mrr - previous_mrr)', 'mrrDiff')

    if (dto.billingFrequencies.length > 0) {
      query.where('billing_frequency IN (:...billingFrequencies)', { billingFrequencies: dto.billingFrequencies })
    }
    if (dto.planNames && dto.planNames.length > 0) {
      query.andWhere('subscription_plan IN (:...planNames)', { planNames: dto.planNames })
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
    let persistence = this.revenueModificationMap.toProjection(revenueModification)

    persistence = await this.ormRepository.save(persistence)

    return this.revenueModificationMap.toDomain(persistence)
  }
}
