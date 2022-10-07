import { injectable } from 'inversify'

import { User } from '../Domain/User/User'
import { ProjectorInterface } from './ProjectorInterface'

@injectable()
export class UserProjector implements ProjectorInterface<User> {
  projectSimple(user: User): Record<string, unknown> {
    return {
      uuid: user.uuid,
      email: user.email,
      protocolVersion: user.version,
    }
  }

  projectCustom(_projectionType: string, _user: User): Record<string, unknown> {
    throw Error('not implemented')
  }

  projectFull(_user: User): Record<string, unknown> {
    throw Error('not implemented')
  }
}
