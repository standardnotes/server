import { MapperInterface, SubscriptionPlanName, UniqueEntityId, Username, Uuid } from '@standardnotes/domain-core'
import { SessionTrace } from '../Domain/Session/SessionTrace'
import { TypeORMSessionTrace } from '../Infra/TypeORM/TypeORMSessionTrace'

export class SessionTracePersistenceMapper implements MapperInterface<SessionTrace, TypeORMSessionTrace> {
  toDomain(projection: TypeORMSessionTrace): SessionTrace {
    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error('Failed to create Uuid from persistence.')
    }
    const userUuid = userUuidOrError.getValue()

    const usernameOrError = Username.create(projection.username)
    if (usernameOrError.isFailed()) {
      throw new Error('Failed to create Username from persistence.')
    }
    const username = usernameOrError.getValue()

    let subscriptionPlanName = null
    if (projection.subscriptionPlanName !== null) {
      const subscriptionPlanNameOrError = SubscriptionPlanName.create(projection.subscriptionPlanName)
      if (subscriptionPlanNameOrError.isFailed()) {
        throw new Error('Failed to create SubscriptionPlanName from persistence.')
      }
      subscriptionPlanName = subscriptionPlanNameOrError.getValue()
    }

    const sessionTraceOrError = SessionTrace.create(
      {
        userUuid,
        username,
        subscriptionPlanName,
        createdAt: projection.createdAt,
        expiresAt: projection.expiresAt,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (sessionTraceOrError.isFailed()) {
      throw new Error('Failed to create SessionTrace from persistence.')
    }

    return sessionTraceOrError.getValue()
  }

  toProjection(domain: SessionTrace): TypeORMSessionTrace {
    const typeOrm = new TypeORMSessionTrace()

    typeOrm.uuid = domain.id.toString()
    typeOrm.userUuid = domain.props.userUuid.value
    typeOrm.username = domain.props.username.value
    typeOrm.subscriptionPlanName = domain.props.subscriptionPlanName ? domain.props.subscriptionPlanName.value : null
    typeOrm.createdAt = domain.props.createdAt
    typeOrm.creationDate = new Date(
      domain.props.createdAt.getFullYear(),
      domain.props.createdAt.getMonth(),
      domain.props.createdAt.getDate(),
    )
    typeOrm.expiresAt = domain.props.expiresAt

    return typeOrm
  }
}
