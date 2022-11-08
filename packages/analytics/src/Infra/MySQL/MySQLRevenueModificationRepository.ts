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
