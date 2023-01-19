import { Either } from '@standardnotes/common'
import { Session } from '../../Session/Session'
import { User } from '../../User/User'

export type CreateCrossServiceTokenDTO = Either<
  {
    user: User
    session?: Session
  },
  {
    userUuid: string
  }
>
