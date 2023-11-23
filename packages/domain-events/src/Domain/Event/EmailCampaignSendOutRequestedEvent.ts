import { DomainEventInterface } from './DomainEventInterface'
import { EmailCampaignSendOutRequestedEventPayload } from './EmailCampaignSendOutRequestedEventPayload'

export interface EmailCampaignSendOutRequestedEvent extends DomainEventInterface {
  type: 'EMAIL_CAMPAIGN_SEND_OUT_REQUESTED'
  payload: EmailCampaignSendOutRequestedEventPayload
}
