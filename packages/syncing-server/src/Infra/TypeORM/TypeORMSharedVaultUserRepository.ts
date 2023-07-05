import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import { TypeORMSharedVaultUser } from './TypeORMSharedVaultUser'
import { SharedVaultUser } from '../../Domain/SharedVault/User/SharedVaultUser'
import { SharedVaultUserRepositoryInterface } from '../../Domain/SharedVault/User/SharedVaultUserRepositoryInterface'

export class TypeORMSharedVaultUserRepository implements SharedVaultUserRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSharedVaultUser>,
    private mapper: MapperInterface<SharedVaultUser, TypeORMSharedVaultUser>,
  ) {}

  async findByUserUuid(userUuid: Uuid): Promise<SharedVaultUser[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_user')
      .where('shared_vault_user.user_uuid = :userUuid', {
        userUuid: userUuid.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async findByUserUuidAndSharedVaultUuid(dto: {
    userUuid: Uuid
    sharedVaultUuid: Uuid
  }): Promise<SharedVaultUser | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_user')
      .where('shared_vault_user.user_uuid = :userUuid', {
        userUuid: dto.userUuid.value,
      })
      .andWhere('shared_vault_user.shared_vault_uuid = :sharedVaultUuid', {
        sharedVaultUuid: dto.sharedVaultUuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async save(sharedVaultUser: SharedVaultUser): Promise<void> {
    const persistence = this.mapper.toProjection(sharedVaultUser)

    await this.ormRepository.save(persistence)
  }

  async findByUuid(uuid: Uuid): Promise<SharedVaultUser | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_user')
      .where('shared_vault_user.uuid = :uuid', {
        uuid: uuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async remove(sharedVaultUser: SharedVaultUser): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(sharedVaultUser))
  }
}
