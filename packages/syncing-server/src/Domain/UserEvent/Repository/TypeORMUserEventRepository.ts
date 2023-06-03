import { Repository, SelectQueryBuilder } from 'typeorm'
import { UserEventQuery, UserEventsRepositoryInterface } from './UserEventRepositoryInterface'
import { UserEvent } from '../Model/UserEvent'

export class TypeORMUserEventRepository implements UserEventsRepositoryInterface {
  constructor(private ormRepository: Repository<UserEvent>) {}

  async create(userEvent: UserEvent): Promise<UserEvent> {
    return this.ormRepository.save(userEvent)
  }

  async save(userEvent: UserEvent): Promise<UserEvent> {
    return this.ormRepository.save(userEvent)
  }

  findByUuid(uuid: string): Promise<UserEvent | null> {
    return this.ormRepository
      .createQueryBuilder('user_event')
      .where('user_event.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async remove(userEvent: UserEvent): Promise<UserEvent> {
    return this.ormRepository.remove(userEvent)
  }

  async findAll(query: UserEventQuery): Promise<UserEvent[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: UserEventQuery): SelectQueryBuilder<UserEvent> {
    const queryBuilder = this.ormRepository.createQueryBuilder('user_event')

    queryBuilder.where('user_event.user_uuid = :userUuid', { userUuid: query.userUuid })

    if (query.eventType) {
      queryBuilder.andWhere('user_event.event_type = :eventType', { eventType: query.eventType })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('user_event.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}
