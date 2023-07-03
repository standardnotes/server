import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import { TypeORMSharedVaultInvite } from './TypeORMSharedVaultInvite'
import { SharedVaultInvite } from '../../Domain/SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultInviteRepositoryInterface } from '../../Domain/SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class TypeORMSharedVaultInviteRepository implements SharedVaultInviteRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSharedVaultInvite>,
    private mapper: MapperInterface<SharedVaultInvite, TypeORMSharedVaultInvite>,
  ) {}

  async save(sharedVaultInvite: SharedVaultInvite): Promise<void> {
    const persistence = this.mapper.toProjection(sharedVaultInvite)

    await this.ormRepository.save(persistence)
  }

  async findByUuid(uuid: Uuid): Promise<SharedVaultInvite | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .where('shared_vault_invite.uuid = :uuid', {
        uuid: uuid.toString(),
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async remove(sharedVaultInvite: SharedVaultInvite): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(sharedVaultInvite))
  }
}
