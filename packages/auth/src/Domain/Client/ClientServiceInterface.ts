import { User } from '../User/User'

export interface ClientServiceInterface {
  sendUserRolesChangedEvent(user: User): Promise<void>
}
