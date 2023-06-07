import { SharedVaultInvite } from '../Model/SharedVaultInvite'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  SharedVaultInviteFindAllForSharedVault,
  SharedVaultInviteFindAllForUserQuery,
  SharedVaultInviteRepositoryInterface,
} from './SharedVaultInviteRepositoryInterface'

export class TypeORMSharedVaultInviteRepository implements SharedVaultInviteRepositoryInterface {
  constructor(private ormRepository: Repository<SharedVaultInvite>) {}

  async create(sharedVaultInvite: SharedVaultInvite): Promise<SharedVaultInvite> {
    return this.ormRepository.save(sharedVaultInvite)
  }

  async save(sharedVaultInvite: SharedVaultInvite): Promise<SharedVaultInvite> {
    return this.ormRepository.save(sharedVaultInvite)
  }

  findByUuid(uuid: string): Promise<SharedVaultInvite | null> {
    return this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .where('shared_vault_invite.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  findByUserUuidAndSharedVaultUuid(userUuid: string, sharedVaultUuid: string): Promise<SharedVaultInvite | null> {
    return this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .where('shared_vault_invite.user_uuid = :userUuid', { userUuid })
      .andWhere('shared_vault_invite.shared_vault_uuid = :sharedVaultUuid', { sharedVaultUuid })
      .getOne()
  }

  async remove(sharedVaultInvite: SharedVaultInvite): Promise<SharedVaultInvite> {
    return this.ormRepository.remove(sharedVaultInvite)
  }

  findAllForSharedVault(query: SharedVaultInviteFindAllForSharedVault): Promise<SharedVaultInvite[]> {
    return this.ormRepository
      .createQueryBuilder('shared_vault_invite')
      .where('shared_vault_invite.shared_vault_uuid = :sharedVaultUuid', { sharedVaultUuid: query.sharedVaultUuid })
      .getMany()
  }

  async findAll(query: SharedVaultInviteFindAllForUserQuery): Promise<SharedVaultInvite[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: SharedVaultInviteFindAllForUserQuery): SelectQueryBuilder<SharedVaultInvite> {
    const queryBuilder = this.ormRepository.createQueryBuilder('shared_vault_invite')

    if (query.userUuid) {
      queryBuilder.where('shared_vault_invite.user_uuid = :userUuid', { userUuid: query.userUuid })
    } else if (query.senderUuid) {
      queryBuilder.where('shared_vault_invite.sender_uuid = :senderUuid', {
        senderUuid: query.senderUuid,
      })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('shared_vault_invite.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}
