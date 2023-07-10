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
