import { Either } from '@standardnotes/common'

import { SimpleSetting } from '../../Setting/SimpleSetting'

export type GetSettingResponse = Either<
  {
    userUuid: string
    setting: SimpleSetting
  },
  {
    sensitive: true
  }
>
