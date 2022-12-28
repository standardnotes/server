import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'

import { Authenticator } from '../../Domain/Authenticator/Authenticator'
import { AuthenticatorRepositoryInterface } from '../../Domain/Authenticator/AuthenticatorRepositoryInterface'
import { TypeORMAuthenticator } from '../TypeORM/TypeORMAuthenticator'

export class MySQLAuthenticatorRepository implements AuthenticatorRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMAuthenticator>,
    private mapper: MapperInterface<Authenticator, TypeORMAuthenticator>,
  ) {}

  async findByUserUuid(userUuid: Uuid): Promise<Authenticator[]> {
    const typeOrm = await this.ormRepository
      .createQueryBuilder('authenticator')
      .where('authenticator.user_uuid = :userUuid', {
        userUuid: userUuid.value,
      })
      .getMany()

    return typeOrm.map((authenticator) => this.mapper.toDomain(authenticator))
  }
}
