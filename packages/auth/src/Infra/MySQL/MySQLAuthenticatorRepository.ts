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

  async findByUserUuidAndCredentialId(userUuid: Uuid, credentialId: Buffer): Promise<Authenticator | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('authenticator')
      .where('authenticator.user_uuid = :userUuid AND authenticator.credential_id = :credentialId', {
        userUuid: userUuid.value,
        credentialId,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async save(authenticator: Authenticator): Promise<void> {
    const persistence = this.mapper.toProjection(authenticator)

    await this.ormRepository.save(persistence)
  }

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
