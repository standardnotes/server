import { User } from '../../User/User'

export type AuthenticateSubscriptionTokenResponse = {
  success: boolean
  user?: User
}
