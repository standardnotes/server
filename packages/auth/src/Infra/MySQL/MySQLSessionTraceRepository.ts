import { MapperInterface, SubscriptionPlanName, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'
import { SessionTrace } from '../../Domain/Session/SessionTrace'
import { SessionTraceRepositoryInterface } from '../../Domain/Session/SessionTraceRepositoryInterface'
import { TypeORMSessionTrace } from '../TypeORM/TypeORMSessionTrace'

export class MySQLSessionTraceRepository implements SessionTraceRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSessionTrace>,
    private mapper: MapperInterface<SessionTrace, TypeORMSessionTrace>,
  ) {}

  async countByDateAndSubscriptionPlanName(date: Date, subscriptionPlanName: SubscriptionPlanName): Promise<number> {
    return this.ormRepository
      .createQueryBuilder('trace')
      .where('trace.creation_date = :creationDate', {
        creationDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      })
      .andWhere('trace.subscription_plan_name = :subscriptionPlanName', {
        subscriptionPlanName: subscriptionPlanName.value,
      })
      .getCount()
  }

  async countByDate(date: Date): Promise<number> {
    return this.ormRepository
      .createQueryBuilder('trace')
      .where('trace.creation_date = :creationDate', {
        creationDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      })
      .getCount()
  }

  async removeExpiredBefore(date: Date): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :date', { date: date.toISOString() })
      .execute()
  }

  async findOneByUserUuidAndDate(userUuid: Uuid, date: Date): Promise<SessionTrace | null> {
    const typeOrm = await this.ormRepository
      .createQueryBuilder('trace')
      .where('trace.user_uuid = :userUuid AND trace.creation_date = :creationDate', {
        userUuid: userUuid.value,
        creationDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      })
      .getOne()

    if (typeOrm === null) {
      return null
    }

    return this.mapper.toDomain(typeOrm)
  }

  async save(sessionTrace: SessionTrace): Promise<void> {
    const persistence = this.mapper.toProjection(sessionTrace)

    await this.ormRepository.save(persistence)
  }
}
