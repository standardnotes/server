import { MapperInterface, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'

import { Authenticator } from '../../Domain/Authenticator/Authenticator'
import { AuthenticatorRepositoryInterface } from '../../Domain/Authenticator/AuthenticatorRepositoryInterface'
import { TypeORMAuthenticator } from './TypeORMAuthenticator'

export class TypeORMAuthenticatorRepository implements AuthenticatorRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMAuthenticator>,
    private mapper: MapperInterface<Authenticator, TypeORMAuthenticator>,
  ) {}

  async updateCounter(id: UniqueEntityId, counter: number): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({
        counter,
      })
      .where('uuid = :uuid', {
        uuid: id.toString(),
      })
      .execute()
  }

  async removeByUserUuid(userUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .where('user_uuid = :userUuid', { userUuid: userUuid.value })
      .execute()
  }

  async findById(id: UniqueEntityId): Promise<Authenticator | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('authenticator')
      .where('authenticator.uuid = :id', {
        id: id.toString(),
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async remove(authenticator: Authenticator): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(authenticator))
  }

  async findByUserUuidAndCredentialId(userUuid: Uuid, credentialId: string): Promise<Authenticator | null> {
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
