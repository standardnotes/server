export const html = (email: string) => `
<p>
  Your encrypted data backup is attached for ${email}. You can import this file using
  the Standard Notes web or desktop app, or by using the offline decryption script available at
  <a style="text-decoration:none !important; text-decoration:none;">standardnotes.org/offline</a>.
</p>

<p>
  <strong>Please note:</strong>
  <ol>
    <li>
      We will never send anything other than a <code>txt</code> file
      as part of your daily backups. To protect yourself against phishing attacks, never open
      any other kind of file, and always open the <code>txt</code> file with a text editor to
      verify its contents before decrypting.
    </li>

    <li>
      We will never include clickable links in this email. Instead, manually verify
      and copy/paste the offline link above in your browser.
    </li>
  </ol>
</p>
<hr />
<p>
  <i>
    Want to disable daily backups? Uninstall 'Daily Email Backups' from your Extensions
    menu in Standard Notes to immediately disable backups.
    Otherwise, reply to this email with "Stop". Note that it may
    take up to 72 hours or more to perform manual removal via the "Stop" method.
  </i>
</p>
`
