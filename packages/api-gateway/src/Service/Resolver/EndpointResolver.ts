import { EndpointResolverInterface } from './EndpointResolverInterface'

export class EndpointResolver implements EndpointResolverInterface {
  constructor(private isConfiguredForHomeServer: boolean) {}

  private readonly endpointToIdentifierMap: Map<string, string> = new Map([
    ['[POST]:auth/sign_in', 'auth.signIn'],
    ['[GET]:auth/params', 'auth.params'],
    ['[POST]:auth/sign_out', 'auth.signOut'],
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
