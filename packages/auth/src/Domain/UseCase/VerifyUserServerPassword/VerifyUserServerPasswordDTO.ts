import { User } from '../../User/User'

export type VerifyUserServerPasswordDTO = {
  serverPassword: string | undefined
  authTokenVersion?: number
} & (
  | {
      userUuid: string
      user?: never
    }
  | {
      user: User
      userUuid?: never
    }
)
