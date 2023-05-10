import { ContainerConfigurationInterface, ServiceIdentifier, ServiceInterface } from '@standardnotes/domain-core'
import { ContainerConfigLoader } from './Container'

export class Service implements ServiceInterface {
  async handleRequest(
    request: Record<string, unknown>,
    response: Record<string, unknown>,
    endpointOrMethodIdentifier: string,
    payload?: string | Record<string, unknown> | undefined,
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getContainerConfiguration(): ContainerConfigurationInterface {
    return new ContainerConfigLoader()
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue()
  }
}
