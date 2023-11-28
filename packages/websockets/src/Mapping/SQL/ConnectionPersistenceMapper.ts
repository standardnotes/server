import { MapperInterface, Timestamps, Uuid } from '@standardnotes/domain-core'

import { Connection } from '../../Domain/Connection/Connection'
import { SQLConnection } from '../../Infra/TypeORM/SQLConnection'

export class ConnectionPersistenceMapper implements MapperInterface<Connection, SQLConnection> {
  toDomain(projection: SQLConnection): Connection {
    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create connection from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const sessionUuidOrError = Uuid.create(projection.sessionUuid)
    if (sessionUuidOrError.isFailed()) {
      throw new Error(`Failed to create connection from projection: ${sessionUuidOrError.getError()}`)
    }
    const sessionUuid = sessionUuidOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create connection from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const connectionOrError = Connection.create({
      userUuid,
      sessionUuid,
      connectionId: projection.connectionId,
      timestamps,
    })
    if (connectionOrError.isFailed()) {
      throw new Error(`Failed to create connection from projection: ${connectionOrError.getError()}`)
    }

    return connectionOrError.getValue()
  }

  toProjection(domain: Connection): SQLConnection {
    const projection = new SQLConnection()

    projection.userUuid = domain.props.userUuid.value
    projection.sessionUuid = domain.props.sessionUuid.value
    projection.connectionId = domain.props.connectionId
    projection.createdAtTimestamp = domain.props.timestamps.createdAt
    projection.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return projection
  }
}
