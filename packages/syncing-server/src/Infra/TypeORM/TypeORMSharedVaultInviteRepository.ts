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

  async findBySenderUuid(senderUuid: Uuid): Promise<SharedVaultInvite[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .where('shared_vault_invite.sender_uuid = :senderUuid', {
        senderUuid: senderUuid.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async findByUserUuid(userUuid: Uuid): Promise<SharedVaultInvite[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .where('shared_vault_invite.user_uuid = :userUuid', {
        userUuid: userUuid.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async removeBySharedVaultUuid(sharedVaultUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .delete()
      .from('shared_vault_invites')
      .where('shared_vault_uuid = :sharedVaultUuid', { sharedVaultUuid: sharedVaultUuid.value })
      .execute()
  }

  async findByUserUuidAndSharedVaultUuid(dto: {
    userUuid: Uuid
    sharedVaultUuid: Uuid
  }): Promise<SharedVaultInvite | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .where('shared_vault_invite.user_uuid = :uuid', {
        uuid: dto.userUuid.value,
      })
      .andWhere('shared_vault_invite.shared_vault_uuid = :sharedVaultUuid', {
        sharedVaultUuid: dto.sharedVaultUuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async save(sharedVaultInvite: SharedVaultInvite): Promise<void> {
    const persistence = this.mapper.toProjection(sharedVaultInvite)

    await this.ormRepository.save(persistence)
  }

  async findByUuid(uuid: Uuid): Promise<SharedVaultInvite | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .where('shared_vault_invite.uuid = :uuid', {
        uuid: uuid.value,
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
