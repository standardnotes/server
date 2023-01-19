import { Either } from '@standardnotes/common'

export type GetUserAnalyticsIdDTO = Either<
  {
    userUuid: string
  },
  {
    userEmail: string
  }
>
