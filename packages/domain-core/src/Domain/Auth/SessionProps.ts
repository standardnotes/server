import { SessionToken } from './SessionToken'

export interface SessionProps {
  accessToken: SessionToken
  refreshToken: SessionToken
  readonlyAccess?: boolean
}
