import {
  ContainerConfigurationInterface,
  ControllerContainerInterface,
  ServiceIdentifier,
  ServiceInterface,
} from '@standardnotes/domain-core'

import { ContainerConfigLoader } from './Container'

export class Service implements ServiceInterface {
  constructor(private controllerContainer: ControllerContainerInterface) {}

  async handleRequest(request: never, response: never, endpointOrMethodIdentifier: string): Promise<void> {
    const method = this.controllerContainer.get(endpointOrMethodIdentifier)

    if (!method) {
      throw new Error(`Method ${endpointOrMethodIdentifier} not found`)
    }

    await method(request, response)
  }

  getContainerConfiguration(): ContainerConfigurationInterface {
    return new ContainerConfigLoader()
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue()
  }
}
