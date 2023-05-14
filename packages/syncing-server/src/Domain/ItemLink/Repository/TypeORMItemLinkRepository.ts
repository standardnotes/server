import { Repository, SelectQueryBuilder } from 'typeorm'
import { ItemLinksRepositoryInterface, UserItemLinksQuery } from './ItemLinkRepositoryInterface'
import { ItemLink } from '../Model/ItemLink'

export class TypeORMItemLinkRepository implements ItemLinksRepositoryInterface {
  constructor(private ormRepository: Repository<ItemLink>) {}

  async create(itemShare: ItemLink): Promise<ItemLink> {
    return this.ormRepository.save(itemShare)
  }

  async remove(itemShare: ItemLink): Promise<ItemLink> {
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
      .from('item_links')
      .where('share_token = :shareToken', { shareToken })
      .execute()
  }

  async findByShareToken(shareToken: string): Promise<ItemLink | null> {
    return this.ormRepository
      .createQueryBuilder('item_share')
      .where('item_share.share_token = :shareToken', {
        shareToken,
      })
      .getOne()
  }

  async findAll(query: UserItemLinksQuery): Promise<ItemLink[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: UserItemLinksQuery): SelectQueryBuilder<ItemLink> {
    const queryBuilder = this.ormRepository.createQueryBuilder('item_share')

    queryBuilder.where('item_share.user_uuid = :userUuid', { userUuid: query.userUuid })

    return queryBuilder
  }
}
