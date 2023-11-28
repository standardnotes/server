import { Repository } from 'typeorm'
import { WebSocketsConnectionRepositoryInterface } from '../../Domain/WebSockets/WebSocketsConnectionRepositoryInterface'
import { SQLConnection } from './SQLConnection'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { Connection } from '../../Domain/Connection/Connection'
import { Logger } from 'winston'

export class SQLConnectionRepository implements WebSocketsConnectionRepositoryInterface {
  constructor(
    protected ormRepository: Repository<SQLConnection>,
    protected mapper: MapperInterface<Connection, SQLConnection>,
    protected logger: Logger,
  ) {}

  async findAllByUserUuid(userUuid: Uuid): Promise<Connection[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :userUuid', { userUuid: userUuid.value })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async saveConnection(connection: Connection): Promise<void> {
    const persistence = this.mapper.toProjection(connection)

    await this.ormRepository.save(persistence)
  }

  async removeConnection(connectionId: string): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from(SQLConnection)
      .where('connection_id = :connectionId', { connectionId })
      .execute()
  }
}
