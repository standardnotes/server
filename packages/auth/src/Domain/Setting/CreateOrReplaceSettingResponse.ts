import { Setting } from './Setting'

export type CreateOrReplaceSettingResponse = {
  status: 'created' | 'replaced'
  setting: Setting
}
