import { safeHtml } from '@standardnotes/common'

export const html = (inviterIdentifier: string, inviteUuid: string) => safeHtml`<p>Hello,</p>
<p>You've been invited to join a Standard Notes premium subscription at no cost. ${inviterIdentifier} has invited you to share the benefits of their subscription plan.</p>
<p>
  <a href='https://app.standardnotes.com/?accept-subscription-invite=${inviteUuid}'>Accept Invite</a>
</p>`
