import { Session } from '../Session/Session'
import { User } from '../User/User'

export type AuthenticateRequestResponse = {
  success: boolean
  responseCode: number
  errorTag?: string
  errorMessage?: string
  session?: Session
  user?: User
}
