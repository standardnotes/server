import { ReadStream } from 'fs'
import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import TYPES from '../../Bootstrap/Types'

import { User } from '../../Domain/User/User'
import { UserRepositoryInterface } from '../../Domain/User/UserRepositoryInterface'

@injectable()
export class MySQLUserRepository implements UserRepositoryInterface {
  constructor(
    @inject(TYPES.ORMUserRepository)
    private ormRepository: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    return this.ormRepository.save(user)
  }

  async remove(user: User): Promise<User> {
    return this.ormRepository.remove(user)
  }

  async streamAll(): Promise<ReadStream> {
    return this.ormRepository.createQueryBuilder('user').stream()
  }

  async findOneByUuid(uuid: string): Promise<User | null> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.uuid = :uuid', { uuid })
      .cache(`user_uuid_${uuid}`, 60000)
      .getOne()
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.ormRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .cache(`user_email_${email}`, 60000)
      .getOne()
  }
}
