import { injectable } from 'inversify'
import { Role } from '../Domain/Role/Role'

import { ProjectorInterface } from './ProjectorInterface'

@injectable()
export class RoleProjector implements ProjectorInterface<Role> {
  projectSimple(role: Role): Record<string, unknown> {
    return {
      uuid: role.uuid,
      name: role.name,
    }
  }

  projectCustom(_projectionType: string, _role: Role): Record<string, unknown> {
    throw Error('not implemented')
  }

  projectFull(_role: Role): Record<string, unknown> {
    throw Error('not implemented')
  }
}
