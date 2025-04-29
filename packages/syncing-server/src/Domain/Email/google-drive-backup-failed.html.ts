import { safeHtml } from '@standardnotes/common'

export const html = safeHtml`<p>Hello,</p>
<p>We recently tried backing up your data to <strong>Google Drive Sync</strong>, but an issue prevented us from
  doing
  so.</p>
<p>
  The usual cause is an expired or revoked token from your sync provider. Please follow
  <a href='https://standardnotes.com/help/27/how-do-i-enable-dropbox-google-drive-or-onedrive-backups'>these
    instructions</a>
  to use CloudLink on the web or desktop Standard Notes application to uninstall then reinstall this sync provider.
</p>
<p>
  We apologize for any inconvenience this may cause.
  If you have any questions, please feel free to reply directly to this email.
</p>
<p>
  Thanks,
  <br>SN</br>
</p>
<a href='https://app.standardnotes.com/?settings=backups'>Mute these emails</a>`
