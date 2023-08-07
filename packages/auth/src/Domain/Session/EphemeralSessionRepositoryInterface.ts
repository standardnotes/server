import { EphemeralSession } from './EphemeralSession'

export interface EphemeralSessionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<EphemeralSession | null>
  findOneByUuidAndUserUuid(uuid: string, userUuid: string): Promise<EphemeralSession | null>
  findAllByUserUuid(userUuid: string): Promise<Array<EphemeralSession>>
  deleteOne(uuid: string, userUuid: string): Promise<void>
  save(ephemeralSession: EphemeralSession): Promise<void>
}
