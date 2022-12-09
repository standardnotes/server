export const html = (email: string, device: string, browser: string, timeAndDate: string) => `
<div>
<p>Hello,</p>
<p>We've detected a new sign-in to your account ${email}</p>
<p>
  <b>Device type</b>: ${device}
</p>
<p>
  <b>Browser type</b>: ${browser}
</p>
<p>
  <strong>Time and date</strong>: <span>${timeAndDate}</span>
</p>
<p>
  If this was you, please disregard this email. If it wasn't you, we recommend signing into your account and
  changing your password immediately, then enabling 2FA.
</p>
<p>
  Thanks,
  <br />
  SN
</p>
<a href="https://app.standardnotes.com/?settings=account">Mute these emails</a>
</div>
`
