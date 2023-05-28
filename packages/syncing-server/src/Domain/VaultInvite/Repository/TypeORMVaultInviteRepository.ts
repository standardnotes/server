import { VaultInvite } from '../Model/VaultInvite'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  VaultInviteFindAllForVault,
  VaultInviteFindAllForUserQuery,
  VaultInviteRepositoryInterface,
} from './VaultInviteRepositoryInterface'

export class TypeORMVaultInviteRepository implements VaultInviteRepositoryInterface {
  constructor(private ormRepository: Repository<VaultInvite>) {}

  async create(vaultInvite: VaultInvite): Promise<VaultInvite> {
    return this.ormRepository.save(vaultInvite)
  }

  async save(vaultInvite: VaultInvite): Promise<VaultInvite> {
    return this.ormRepository.save(vaultInvite)
  }

  findByUuid(uuid: string): Promise<VaultInvite | null> {
    return this.ormRepository
      .createQueryBuilder('vault_invite')
      .where('vault_invite.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  findByUserUuidAndVaultUuid(userUuid: string, vaultUuid: string): Promise<VaultInvite | null> {
    return this.ormRepository
      .createQueryBuilder('vault_invite')
      .where('vault_invite.user_uuid = :userUuid', { userUuid })
      .andWhere('vault_invite.vault_uuid = :vaultUuid', { vaultUuid })
      .getOne()
  }

  async remove(vaultInvite: VaultInvite): Promise<VaultInvite> {
    return this.ormRepository.remove(vaultInvite)
  }

  findAllForVault(query: VaultInviteFindAllForVault): Promise<VaultInvite[]> {
    return this.ormRepository
      .createQueryBuilder('vault_invite')
      .where('vault_invite.vault_uuid = :vaultUuid', { vaultUuid: query.vaultUuid })
      .getMany()
  }

  async findAll(query: VaultInviteFindAllForUserQuery): Promise<VaultInvite[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: VaultInviteFindAllForUserQuery): SelectQueryBuilder<VaultInvite> {
    const queryBuilder = this.ormRepository.createQueryBuilder('vault_invite')

    if (query.userUuid) {
      queryBuilder.where('vault_invite.user_uuid = :userUuid', { userUuid: query.userUuid })
    } else if (query.inviterUuid) {
      queryBuilder.where('vault_invite.inviter_uuid = :inviterUuid', {
        inviterUuid: query.inviterUuid,
      })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('vault_invite.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}
