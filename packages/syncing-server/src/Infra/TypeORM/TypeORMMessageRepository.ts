import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import { MessageRepositoryInterface } from '../../Domain/Message/MessageRepositoryInterface'
import { TypeORMMessage } from './TypeORMMessage'
import { Message } from '../../Domain/Message/Message'

export class TypeORMMessageRepository implements MessageRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMMessage>,
    private mapper: MapperInterface<Message, TypeORMMessage>,
  ) {}

  async findByRecipientUuidUpdatedAfter(uuid: Uuid, updatedAtTimestamp: number): Promise<Message[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('message')
      .where('message.recipient_uuid = :recipientUuid', {
        recipientUuid: uuid.value,
      })
      .andWhere('message.updated_at_timestamp > :updatedAtTimestamp', {
        updatedAtTimestamp,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async findByRecipientUuid(uuid: Uuid): Promise<Message[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('message')
      .where('message.recipient_uuid = :recipientUuid', {
        recipientUuid: uuid.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async findBySenderUuid(uuid: Uuid): Promise<Message[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('message')
      .where('message.sender_uuid = :senderUuid', {
        senderUuid: uuid.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async findByRecipientUuidAndReplaceabilityIdentifier(dto: {
    recipientUuid: Uuid
    replaceabilityIdentifier: string
  }): Promise<Message | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('message')
      .where('message.recipientUuid = :recipientUuid', {
        recipientUuid: dto.recipientUuid.value,
      })
      .andWhere('message.replaceabilityIdentifier = :replaceabilityIdentifier', {
        replaceabilityIdentifier: dto.replaceabilityIdentifier,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async findByUuid(uuid: Uuid): Promise<Message | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('message')
      .where('message.uuid = :uuid', {
        uuid: uuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async remove(message: Message): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(message))
  }

  async save(message: Message): Promise<void> {
    const persistence = this.mapper.toProjection(message)

    await this.ormRepository.save(persistence)
  }
}
