import { User } from '../User/User'
import { SettingProps } from './SettingProps'

export type CreateOrReplaceSettingDto = {
  user: User
  props: SettingProps
}
