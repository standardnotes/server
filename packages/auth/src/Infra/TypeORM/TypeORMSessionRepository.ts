import { TimerInterface } from '@standardnotes/time'
import * as dayjs from 'dayjs'

import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import TYPES from '../../Bootstrap/Types'

import { Session } from '../../Domain/Session/Session'
import { SessionRepositoryInterface } from '../../Domain/Session/SessionRepositoryInterface'
import { Uuid } from '@standardnotes/domain-core'

@injectable()
export class TypeORMSessionRepository implements SessionRepositoryInterface {
  constructor(
    @inject(TYPES.Auth_ORMSessionRepository)
    private ormRepository: Repository<Session>,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
  ) {}

  async insert(session: Session): Promise<void> {
    session.updatedAt = this.timer.getUTCDate()

    await this.ormRepository.insert(session)
  }

  async update(session: Session): Promise<void> {
    session.updatedAt = this.timer.getUTCDate()

    const { uuid, ...sessionProps } = session

    await this.ormRepository.update({ uuid }, sessionProps)
  }

  async remove(session: Session): Promise<Session> {
    return this.ormRepository.remove(session)
  }

  async removeExpiredBefore(date: Date): Promise<void> {
    await this.ormRepository.createQueryBuilder().delete().where('refresh_expiration < :date', { date }).execute()
  }

  async clearUserAgentByUserUuid(userUuid: string): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('session')
      .update()
      .set({
        userAgent: null,
        updatedAt: this.timer.getUTCDate(),
      })
      .where('user_uuid = :userUuid', { userUuid })
      .execute()
  }

  async findAllByRefreshExpirationAndUserUuid(userUuid: string): Promise<Session[]> {
    return this.ormRepository
      .createQueryBuilder('session')
      .where('session.refresh_expiration > :refresh_expiration AND session.user_uuid = :user_uuid', {
        refresh_expiration: dayjs.utc().toDate(),
        user_uuid: userUuid,
      })
      .getMany()
  }

  async findOneByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Session | null> {
    return this.ormRepository
      .createQueryBuilder('session')
      .where('session.uuid = :uuid AND session.user_uuid = :user_uuid', { uuid, user_uuid: userUuid })
      .getOne()
  }

  async deleteOneByUuid(uuid: string): Promise<void> {
    await this.ormRepository.createQueryBuilder('session').delete().where('uuid = :uuid', { uuid }).execute()
  }

  async findOneByUuid(uuid: string): Promise<Session | null> {
    return this.ormRepository.createQueryBuilder('session').where('session.uuid = :uuid', { uuid }).getOne()
  }

  async findAllByUserUuid(userUuid: string): Promise<Array<Session>> {
    return this.ormRepository
      .createQueryBuilder('session')
      .where('session.user_uuid = :user_uuid', {
        user_uuid: userUuid,
      })
      .getMany()
  }

  async deleteAllByUserUuidExceptOne(dto: { userUuid: Uuid; currentSessionUuid: Uuid }): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('session')
      .delete()
      .where('user_uuid = :user_uuid AND uuid != :current_session_uuid', {
        user_uuid: dto.userUuid.value,
        current_session_uuid: dto.currentSessionUuid.value,
      })
      .execute()
  }
}
