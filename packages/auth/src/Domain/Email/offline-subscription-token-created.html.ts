export const html = (userEmail: string, offlineSubscriptionDashboardUrl: string) => `<div class="sn-component">
<div class="sk-panel static">
  <div class="sk-panel-content">
    <div class="sk-panel-section">
      <h1 class="h1 title sk-panel-row">
        <div class="sk-panel-column">
          Access your Standard Notes Subscription Dashboard,
        </div>
      </h1>
      <div class="faded sk-panel-row small">Registered as ${userEmail}</div>
    </div>
    <div class="sk-panel-section">
      <div class="title">Link to your subscription dashboard: <a
          href="${offlineSubscriptionDashboardUrl}">${offlineSubscriptionDashboardUrl}</a></div>
    </div>
    <div class="sk-panel-section">
      <p>
        Get help any time by visiting our <a href="https://standardnotes.com/help">Help page</a>
        or by replying directly to this email.
      </p>
    </div>
  </div>
</div>
</div>`
