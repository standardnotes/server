import { AsymmetricMessage } from '../Model/AsymmetricMessage'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  AsymmetricMessageFindAllForUserQuery,
  AsymmetricMessageRepositoryInterface,
} from './AsymmetricMessageRepositoryInterface'

export class TypeORMAsymmetricMessageRepository implements AsymmetricMessageRepositoryInterface {
  constructor(private ormRepository: Repository<AsymmetricMessage>) {}

  async create(asymmetricMessage: AsymmetricMessage): Promise<AsymmetricMessage> {
    return this.ormRepository.save(asymmetricMessage)
  }

  async save(asymmetricMessage: AsymmetricMessage): Promise<AsymmetricMessage> {
    return this.ormRepository.save(asymmetricMessage)
  }

  findByUuid(uuid: string): Promise<AsymmetricMessage | null> {
    return this.ormRepository
      .createQueryBuilder('asymmetric_message')
      .where('asymmetric_message.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async remove(asymmetricMessage: AsymmetricMessage): Promise<AsymmetricMessage> {
    return this.ormRepository.remove(asymmetricMessage)
  }

  async findAll(query: AsymmetricMessageFindAllForUserQuery): Promise<AsymmetricMessage[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(
    query: AsymmetricMessageFindAllForUserQuery,
  ): SelectQueryBuilder<AsymmetricMessage> {
    const queryBuilder = this.ormRepository.createQueryBuilder('asymmetric_message')

    if (query.userUuid) {
      queryBuilder.where('asymmetric_message.user_uuid = :userUuid', { userUuid: query.userUuid })
    } else if (query.senderUuid) {
      queryBuilder.where('asymmetric_message.sender_uuid = :senderUuid', {
        senderUuid: query.senderUuid,
      })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('asymmetric_message.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}
