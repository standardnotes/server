import { safeHtml } from '@standardnotes/common'

export const html = (newEmail: string) => safeHtml`
<p>Hello,</p>

<p>We are writing to inform you that your request to update your email address has been successfully processed. The email address associated with your Standard Notes account has now been changed to the following:</p>
<p>New Email Address: ${newEmail}</p>

<p>From now on, you can log in to your account using your new email address. Your password and all other account details remain the same. If you did not initiate this change or have any concerns about this update, please contact our support team by visiting our <a href="https://standardnotes.com/help">help page</a>
or by replying directly to this email.</p>

<p>Best regards,</p>
<p>
Standard Notes
</p>
`
