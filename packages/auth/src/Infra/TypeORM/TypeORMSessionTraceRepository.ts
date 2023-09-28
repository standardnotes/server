import { MapperInterface, SubscriptionPlanName, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { Repository } from 'typeorm'

import { SessionTrace } from '../../Domain/Session/SessionTrace'
import { SessionTraceRepositoryInterface } from '../../Domain/Session/SessionTraceRepositoryInterface'
import { TypeORMSessionTrace } from './TypeORMSessionTrace'

export class TypeORMSessionTraceRepository implements SessionTraceRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSessionTrace>,
    private mapper: MapperInterface<SessionTrace, TypeORMSessionTrace>,
    private timer: TimerInterface,
  ) {}

  async countByDateAndSubscriptionPlanName(date: Date, subscriptionPlanName: SubscriptionPlanName): Promise<number> {
    return this.ormRepository
      .createQueryBuilder('trace')
      .where('trace.creation_date = :creationDate', {
        creationDate: this.timer.convertDateToFormattedString(date, 'YYYY-MM-DD'),
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
        creationDate: this.timer.convertDateToFormattedString(date, 'YYYY-MM-DD'),
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
        creationDate: this.timer.convertDateToFormattedString(date, 'YYYY-MM-DD'),
      })
      .getOne()

    if (typeOrm === null) {
      return null
    }

    return this.mapper.toDomain(typeOrm)
  }

  async insert(sessionTrace: SessionTrace): Promise<void> {
    const persistence = this.mapper.toProjection(sessionTrace)

    await this.ormRepository.insert(persistence)
  }
}
