import { injectable } from 'inversify'

import { User } from '../Domain/User/User'
import { ProjectorInterface } from './ProjectorInterface'
import { SimpleUserProjection } from './SimpleUserProjection'

@injectable()
export class UserProjector implements ProjectorInterface<User> {
  projectSimple(user: User): SimpleUserProjection {
    return {
      uuid: user.uuid,
      email: user.email,
      protocolVersion: user.version,
      publicKey: user.publicKey ?? undefined,
      signingPublicKey: user.signingPublicKey ?? undefined,
    }
  }

  projectCustom(_projectionType: string, _user: User): Record<string, unknown> {
    throw Error('not implemented')
  }

  projectFull(_user: User): Record<string, unknown> {
    throw Error('not implemented')
  }
}
