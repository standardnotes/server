export interface EndpointResolverInterface {
  resolveEndpointOrMethodIdentifier(endpoint: string): string
}
