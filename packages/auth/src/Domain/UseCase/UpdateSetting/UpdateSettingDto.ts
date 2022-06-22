import { Uuid } from '@standardnotes/common'

import { SettingProps } from '../../Setting/SettingProps'

export type UpdateSettingDto = {
  userUuid: Uuid
  props: SettingProps
}
