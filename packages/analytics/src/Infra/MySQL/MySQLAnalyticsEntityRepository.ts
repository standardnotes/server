import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsEntity } from '../../Domain/Entity/AnalyticsEntity'
import { AnalyticsEntityRepositoryInterface } from '../../Domain/Entity/AnalyticsEntityRepositoryInterface'

@injectable()
export class MySQLAnalyticsEntityRepository implements AnalyticsEntityRepositoryInterface {
  constructor(
    @inject(TYPES.ORMAnalyticsEntityRepository)
    private ormRepository: Repository<AnalyticsEntity>,
  ) {}

  async findOneByUserEmail(email: string): Promise<AnalyticsEntity | null> {
    return this.ormRepository
      .createQueryBuilder('analytics_entity')
      .where('analytics_entity.user_email = :email', { email })
      .getOne()
  }

  async findOneByUserUuid(userUuid: string): Promise<AnalyticsEntity | null> {
    return this.ormRepository
      .createQueryBuilder('analytics_entity')
      .where('analytics_entity.user_uuid = :userUuid', { userUuid })
      .getOne()
  }

  async save(analyticsEntity: AnalyticsEntity): Promise<AnalyticsEntity> {
    return this.ormRepository.save(analyticsEntity)
  }

  async remove(analyticsEntity: AnalyticsEntity): Promise<void> {
    await this.ormRepository.remove(analyticsEntity)
  }
}
