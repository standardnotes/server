import { DomainEventInterface } from './DomainEventInterface'

import { MuteEmailsSettingChangedEventPayload } from './MuteEmailsSettingChangedEventPayload'

export interface MuteEmailsSettingChangedEvent extends DomainEventInterface {
  type: 'MUTE_EMAILS_SETTING_CHANGED'
  payload: MuteEmailsSettingChangedEventPayload
}
