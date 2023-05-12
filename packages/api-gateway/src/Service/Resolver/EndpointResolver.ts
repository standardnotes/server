import { EndpointResolverInterface } from './EndpointResolverInterface'

export class EndpointResolver implements EndpointResolverInterface {
  constructor(private isConfiguredForHomeServer: boolean) {}

  private readonly endpointToMethodMap: Map<string, string> = new Map([
    ['/healthcheck', 'healthcheck'],
    ['auth/params', 'auth.params'],
  ])

  resolveEndpointOrMethodIdentifier(endpoint: string): string {
    if (!this.isConfiguredForHomeServer) {
      return endpoint
    }
    const method = this.endpointToMethodMap.get(endpoint)

    if (!method) {
      throw new Error(`Endpoint ${endpoint} not found`)
    }

    return method
  }
}
