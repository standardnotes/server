import { EndpointResolverInterface } from './EndpointResolverInterface'

export class EndpointResolver implements EndpointResolverInterface {
  constructor(private isConfiguredForHomeServer: boolean) {}

  private readonly endpointToIdentifierMap: Map<string, string> = new Map([
    // Auth Middleware
    ['[POST]:sessions/validate', 'auth.sessions.validate'],
    // Actions Controller
    ['[POST]:auth/sign_in', 'auth.signIn'],
    ['[GET]:auth/params', 'auth.params'],
    ['[POST]:auth/sign_out', 'auth.signOut'],
    ['[POST]:auth/recovery/codes', 'auth.generateRecoveryCodes'],
    ['[POST]:auth/recovery/login', 'auth.signInWithRecoveryCodes'],
    ['[POST]:auth/recovery/params', 'auth.recoveryKeyParams'],
    // v2 Actions Controller
    ['[POST]:auth/pkce_sign_in', 'auth.pkceSignIn'],
    ['[POST]:auth/pkce_params', 'auth.pkceParams'],
    // Authenticators Controller
    ['[DELETE]:authenticators/:authenticatorId', 'auth.authenticators.delete'],
    ['[GET]:authenticators/', 'auth.authenticators.list'],
    ['[GET]:authenticators/generate-registration-options', 'auth.authenticators.generateRegistrationOptions'],
    ['[POST]:authenticators/generate-authentication-options', 'auth.authenticators.generateAuthenticationOptions'],
    ['[POST]:authenticators/verify-registration', 'auth.authenticators.verifyRegistrationResponse'],
    // Files Controller
    ['[POST]:valet-tokens', 'auth.valet-tokens.create'],
    // Offline Controller
    ['[GET]:offline/features', 'auth.offline.features'],
    ['[POST]:offline/subscription-tokens', 'auth.offline.subscriptionTokens.create'],
    // Sessions Controller
    ['[GET]:sessions', 'auth.sessions.list'],
    ['[DELETE]:session', 'auth.sessions.delete'],
    ['[DELETE]:session/all', 'auth.sessions.deleteAll'],
    ['[POST]:session/refresh', 'auth.sessions.refresh'],
    // Subscription Invites Controller
    ['[POST]:subscription-invites', 'auth.subscriptionInvites.create'],
    ['[GET]:subscription-invites', 'auth.subscriptionInvites.list'],
    ['[DELETE]:subscription-invites/:inviteUuid', 'auth.subscriptionInvites.delete'],
    ['[POST]:subscription-invites/:inviteUuid/accept', 'auth.subscriptionInvites.accept'],
    // Tokens Controller
    ['[POST]:subscription-tokens', 'auth.subscription-tokens.create'],
    // Users Controller
    ['[PATCH]:users/:userId', 'auth.users.update'],
    ['[PUT]:users/:userUuid/attributes/credentials', 'auth.users.updateCredentials'],
    ['[GET]:users/params', 'auth.users.getKeyParams'],
    ['[DELETE]:users/:userUuid', 'auth.users.delete'],
    ['[POST]:listed', 'auth.users.createListedAccount'],
    ['[POST]:auth', 'auth.users.register'],
    ['[GET]:users/:userUuid/settings', 'auth.users.getSettings'],
    ['[PUT]:users/:userUuid/settings', 'auth.users.updateSetting'],
    ['[GET]:users/:userUuid/settings/:settingName', 'auth.users.getSetting'],
    ['[DELETE]:users/:userUuid/settings/:settingName', 'auth.users.deleteSetting'],
    ['[GET]:users/:userUuid/subscription-settings/:subscriptionSettingName', 'auth.users.getSubscriptionSetting'],
    ['[GET]:users/:userUuid/features', 'auth.users.getFeatures'],
    ['[GET]:users/:userUuid/subscription', 'auth.users.getSubscription'],
    ['[GET]:offline/users/subscription', 'auth.users.getOfflineSubscriptionByToken'],
    ['[POST]:users/:userUuid/requests', 'auth.users.createRequest'],
    // Syncing Server
    ['[POST]:items/sync', 'sync.items.sync'],
    ['[POST]:items/check-integrity', 'sync.items.check_integrity'],
    ['[GET]:items/:uuid', 'sync.items.get_item'],
    // Revisions Controller V2
    ['[GET]:items/:itemUuid/revisions', 'revisions.revisions.getRevisions'],
    ['[GET]:items/:itemUuid/revisions/:id', 'revisions.revisions.getRevision'],
    ['[DELETE]:items/:itemUuid/revisions/:id', 'revisions.revisions.deleteRevision'],
    // Messages Controller
    ['[GET]:messages/', 'sync.messages.get-received'],
    ['[GET]:messages/outbound', 'sync.messages.get-sent'],
    ['[POST]:messages/', 'sync.messages.send'],
    ['[DELETE]:messages/inbound', 'sync.messages.delete-all'],
    ['[DELETE]:messages/:messageUuid', 'sync.messages.delete'],
    // Shared Vaults Controller
    ['[GET]:shared-vaults/', 'sync.shared-vaults.get-vaults'],
    ['[POST]:shared-vaults/', 'sync.shared-vaults.create-vault'],
    ['[DELETE]:shared-vaults/:sharedVaultUuid', 'sync.shared-vaults.delete-vault'],
    ['[POST]:shared-vaults/:sharedVaultUuid/valet-tokens', 'sync.shared-vaults.create-file-valet-token'],
    // Shared Vault Invites Controller
    ['[POST]:shared-vaults/:sharedVaultUuid/invites', 'sync.shared-vault-invites.create'],
    ['[PATCH]:shared-vaults/:sharedVaultUuid/invites/:inviteUuid', 'sync.shared-vault-invites.update'],
    ['[POST]:shared-vaults/:sharedVaultUuid/invites/:inviteUuid/accept', 'sync.shared-vault-invites.accept'],
    ['[POST]:shared-vaults/:sharedVaultUuid/invites/:inviteUuid/decline', 'sync.shared-vault-invites.decline'],
    ['[DELETE]:shared-vaults/invites/inbound', 'sync.shared-vault-invites.delete-inbound'],
    ['[DELETE]:shared-vaults/invites/outbound', 'sync.shared-vault-invites.delete-outbound'],
    ['[GET]:shared-vaults/invites/outbound', 'sync.shared-vault-invites.get-outbound'],
    ['[GET]:shared-vaults/invites', 'sync.shared-vault-invites.get-user-invites'],
    ['[GET]:shared-vaults/:sharedVaultUuid/invites', 'sync.shared-vault-invites.get-vault-invites'],
    ['[DELETE]:shared-vaults/:sharedVaultUuid/invites/:inviteUuid', 'sync.shared-vault-invites.delete-invite'],
    ['[DELETE]:shared-vaults/:sharedVaultUuid/invites', 'sync.shared-vault-invites.delete-all'],
    // Shared Vault Users Controller
    ['[GET]:shared-vaults/:sharedVaultUuid/users', 'sync.shared-vault-users.get-users'],
    ['[DELETE]:shared-vaults/:sharedVaultUuid/users/:userUuid', 'sync.shared-vault-users.remove-user'],
    [
      '[POST]:shared-vaults/:sharedVaultUuid/users/:userUuid/designate-survivor',
      'sync.shared-vault-users.designate-survivor',
    ],
  ])

  resolveEndpointOrMethodIdentifier(method: string, endpoint: string, ...params: string[]): string {
    if (!this.isConfiguredForHomeServer) {
      if (params.length > 0) {
        return params.reduce((acc, param) => acc.replace(/:[a-zA-Z0-9]+/, param), endpoint)
      }

      return endpoint
    }
    const identifier = this.endpointToIdentifierMap.get(`[${method}]:${endpoint}`)

    if (!identifier) {
      throw new Error(`Endpoint [${method}]:${endpoint} not found`)
    }

    return identifier
  }
}
