import { ContainerConfigurationInterface } from '../DI/ContainerConfigurationInterface'
import { ServiceIdentifier } from './ServiceIdentifier'

export interface ServiceInterface {
  getContainerConfiguration(): ContainerConfigurationInterface
  getId(): ServiceIdentifier
  handleRequest(
    request: Record<string, unknown>,
    response: Record<string, unknown>,
    endpointOrMethodIdentifier: string,
    payload?: Record<string, unknown> | string,
  ): Promise<void>
}
