import { Email, Username } from '@standardnotes/domain-core'
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

  async findOneByUuid(uuid: string): Promise<User | null> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.uuid = :uuid', { uuid })
      .cache(`user_uuid_${uuid}`, 60000)
      .getOne()
  }

  async findOneByUsernameOrEmail(usernameOrEmail: Email | Username): Promise<User | null> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: usernameOrEmail.value })
      .cache(`user_email_${usernameOrEmail.value}`, 60000)
      .getOne()
  }
}
