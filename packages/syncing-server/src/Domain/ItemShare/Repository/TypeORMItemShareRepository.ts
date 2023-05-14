import { Repository, SelectQueryBuilder } from 'typeorm'
import { ItemShareRepositoryInterface, UserItemSharesQuery } from './ItemShareRepositoryInterface'
import { ItemShare } from '../Model/ItemShare'

export class TypeORMItemShareRepository implements ItemShareRepositoryInterface {
  constructor(private ormRepository: Repository<ItemShare>) {}

  async create(itemShare: ItemShare): Promise<ItemShare> {
    return this.ormRepository.save(itemShare)
  }

  async remove(itemShare: ItemShare): Promise<ItemShare> {
    return this.ormRepository.remove(itemShare)
  }

  async expire(shareToken: string): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('item_share')
      .update()
      .set({
        encryptedContentKey: null,
        fileRemoteIdentifier: null,
        consumed: true,
      })
      .where('share_token = :shareToken', {
        shareToken: shareToken,
      })
      .execute()
  }

  async updateEncryptedContentKey(dto: { shareToken: string; encryptedContentKey: string }): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('item_share')
      .update()
      .set({
        encryptedContentKey: dto.encryptedContentKey,
      })
      .where('share_token = :shareToken', {
        shareToken: dto.shareToken,
      })
      .execute()
  }

  async deleteByShareToken(shareToken: string): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('item_share')
      .delete()
      .from('item_shares')
      .where('share_token = :shareToken', { shareToken })
      .execute()
  }

  async findByShareToken(shareToken: string): Promise<ItemShare | null> {
    return this.ormRepository
      .createQueryBuilder('item_share')
      .where('item_share.share_token = :shareToken', {
        shareToken,
      })
      .getOne()
  }

  async findAll(query: UserItemSharesQuery): Promise<ItemShare[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: UserItemSharesQuery): SelectQueryBuilder<ItemShare> {
    const queryBuilder = this.ormRepository.createQueryBuilder('item_share')

    queryBuilder.where('item_share.user_uuid = :userUuid', { userUuid: query.userUuid })

    return queryBuilder
  }
}
