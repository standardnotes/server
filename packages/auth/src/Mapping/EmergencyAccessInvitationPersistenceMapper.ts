import { Dates, MapperInterface, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { EmergencyAccessInvitation } from '../Domain/EmergencyAccess/EmergencyAccessInvitation'
import { EmergencyAccessInvitationStatus } from '../Domain/EmergencyAccess/EmergencyAccessInvitationStatus'
import { TypeORMEmergencyAccessInvitation } from '../Infra/TypeORM/TypeORMEmergencyAccessInvitation'

export class EmergencyAccessInvitationPersistenceMapper
  implements MapperInterface<EmergencyAccessInvitation, TypeORMEmergencyAccessInvitation>
{
  toDomain(projection: TypeORMEmergencyAccessInvitation): EmergencyAccessInvitation {
    const grantorUuidOrError = Uuid.create(projection.grantorUuid)
    if (grantorUuidOrError.isFailed()) {
      throw new Error(grantorUuidOrError.getError())
    }
    const grantorUuid = grantorUuidOrError.getValue()

    const granteeUuidOrError = Uuid.create(projection.granteeUuid)
    if (granteeUuidOrError.isFailed()) {
      throw new Error(granteeUuidOrError.getError())
    }
    const granteeUuid = granteeUuidOrError.getValue()

    const emergencyAccessInvitationStatusOrError = EmergencyAccessInvitationStatus.create(projection.status)
    if (emergencyAccessInvitationStatusOrError.isFailed()) {
      throw new Error(emergencyAccessInvitationStatusOrError.getError())
    }
    const emergencyAccessInvitationStatus = emergencyAccessInvitationStatusOrError.getValue()

    const datesOrError = Dates.create(projection.createdAt, projection.updatedAt)
    if (datesOrError.isFailed()) {
      throw new Error(datesOrError.getError())
    }
    const dates = datesOrError.getValue()

    const emergencyAccessInvitationOrError = EmergencyAccessInvitation.create(
      {
        grantorUuid,
        granteeUuid,
        status: emergencyAccessInvitationStatus,
        expiresAt: projection.expiresAt,
        dates,
      },
      new UniqueEntityId(projection.uuid),
    )
    const emergencyAccessInvitation = emergencyAccessInvitationOrError.getValue()

    return emergencyAccessInvitation
  }

  toProjection(domain: EmergencyAccessInvitation): TypeORMEmergencyAccessInvitation {
    const typeorm = new TypeORMEmergencyAccessInvitation()

    typeorm.uuid = domain.id.toString()
    typeorm.grantorUuid = domain.props.grantorUuid.value
    typeorm.granteeUuid = domain.props.granteeUuid.value
    typeorm.status = domain.props.status.value
    typeorm.expiresAt = domain.props.expiresAt
    typeorm.createdAt = domain.props.dates.createdAt
    typeorm.updatedAt = domain.props.dates.updatedAt

    return typeorm
  }
}
