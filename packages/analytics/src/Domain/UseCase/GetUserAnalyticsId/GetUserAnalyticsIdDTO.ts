import { Either, Uuid } from '@standardnotes/common'

export type GetUserAnalyticsIdDTO = Either<
  {
    userUuid: Uuid
  },
  {
    userEmail: string
  }
>
