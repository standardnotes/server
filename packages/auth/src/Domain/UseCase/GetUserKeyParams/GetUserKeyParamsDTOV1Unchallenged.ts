import { User } from '../../User/User'

export type GetUserKeyParamsDTOV1Unchallenged = {
  authenticated: boolean
  email?: string
  userUuid?: string
  authenticatedUser?: User
}
