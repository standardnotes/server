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
    ['[PUT]:auth/params', 'auth.users.getKeyParams'],
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
      throw new Error(`Endpoint ${endpoint} not found`)
    }

    return identifier
  }
}
