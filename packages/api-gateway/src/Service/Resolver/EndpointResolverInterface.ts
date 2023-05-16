export interface EndpointResolverInterface {
  resolveEndpointOrMethodIdentifier(method: string, endpoint: string, ...params: string[]): string
}
