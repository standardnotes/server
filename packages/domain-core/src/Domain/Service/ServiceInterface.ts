import { ContainerConfigurationInterface } from '../DI/ContainerConfigurationInterface'
import { ServiceIdentifier } from './ServiceIdentifier'

export interface ServiceInterface {
  getContainerConfiguration(): ContainerConfigurationInterface
  getId(): ServiceIdentifier
  handleRequest(request: never, response: never, endpointOrMethodIdentifier: string): Promise<void>
}
