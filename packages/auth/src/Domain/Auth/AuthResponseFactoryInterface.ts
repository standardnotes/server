import { Session } from '../Session/Session'
import { User } from '../User/User'
import { AuthResponse20161215 } from './AuthResponse20161215'
import { AuthResponse20200115 } from './AuthResponse20200115'

export interface AuthResponseFactoryInterface {
  createResponse(dto: {
    user: User
    apiVersion: string
    userAgent: string
    ephemeralSession: boolean
    readonlyAccess: boolean
  }): Promise<{ response: AuthResponse20161215 | AuthResponse20200115; session?: Session }>
}
