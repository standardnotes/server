import { Email, Username, Uuid } from '@standardnotes/domain-core'
import { ReadStream } from 'fs'
import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import TYPES from '../../Bootstrap/Types'

import { User } from '../../Domain/User/User'
import { UserRepositoryInterface } from '../../Domain/User/UserRepositoryInterface'

@injectable()
export class TypeORMUserRepository implements UserRepositoryInterface {
  constructor(
    @inject(TYPES.Auth_ORMUserRepository)
    private ormRepository: Repository<User>,
  ) {}

  async findAllCreatedBetween(dto: { start: Date; end: Date; offset: number; limit: number }): Promise<User[]> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.created_at BETWEEN :start AND :end', { start: dto.start, end: dto.end })
      .orderBy('user.created_at', 'ASC')
      .take(dto.limit)
      .skip(dto.offset)
      .getMany()
  }

  async countAllCreatedBetween(start: Date, end: Date): Promise<number> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.created_at BETWEEN :start AND :end', { start, end })
      .getCount()
  }

  async save(user: User): Promise<User> {
    return this.ormRepository.save(user)
  }

  async remove(user: User): Promise<User> {
    return this.ormRepository.remove(user)
  }

  async streamAll(): Promise<ReadStream> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('created_at < :createdAt', { createdAt: new Date().toISOString() })
      .stream()
  }

  async streamTeam(memberEmail?: Email): Promise<ReadStream> {
    const queryBuilder = this.ormRepository.createQueryBuilder()
    if (memberEmail !== undefined) {
      queryBuilder.where('email = :email', { email: memberEmail.value })
    } else {
      queryBuilder.where('email LIKE :email', { email: '%@standardnotes.com' })
    }

    return queryBuilder.stream()
  }

  async findOneByUuid(uuid: Uuid): Promise<User | null> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.uuid = :uuid', { uuid: uuid.value })
      .cache(`user_uuid_${uuid.value}`, 60000)
      .getOne()
  }

  async findOneByUsernameOrEmail(usernameOrEmail: Email | Username): Promise<User | null> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: usernameOrEmail.value })
      .getOne()
  }

  async findAllByUsernameOrEmail(usernameOrEmail: Email | Username): Promise<User[]> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: usernameOrEmail.value })
      .getMany()
  }
}
