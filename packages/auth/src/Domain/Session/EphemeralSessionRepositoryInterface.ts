import { EphemeralSession } from './EphemeralSession'

export interface EphemeralSessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<EphemeralSession | null>
  findOneByUuidAndUserUuid(uuid: string, userUuid: string): Promise<EphemeralSession | null>
  findAllByUserUuid(userUuid: string): Promise<Array<EphemeralSession>>
  deleteOne(uuid: string, userUuid: string): Promise<void>
  insert(ephemeralSession: EphemeralSession): Promise<void>
  update(ephemeralSession: EphemeralSession): Promise<void>
}
