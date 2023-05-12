import {
  ControllerContainerInterface,
  ServiceContainerInterface,
  ServiceIdentifier,
  ServiceInterface,
} from '@standardnotes/domain-core'

import { ContainerConfigLoader } from './Container'

export class Service implements ServiceInterface {
  constructor(
    private serviceContainer: ServiceContainerInterface,
    private controllerContainer: ControllerContainerInterface,
  ) {
    this.serviceContainer.register(ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue(), this)
  }

  async handleRequest(request: never, response: never, endpointOrMethodIdentifier: string): Promise<void> {
    const method = this.controllerContainer.get(endpointOrMethodIdentifier)

    if (!method) {
      throw new Error(`Method ${endpointOrMethodIdentifier} not found`)
    }

    await method(request, response)
  }

  async getContainer(): Promise<unknown> {
    const config = new ContainerConfigLoader()

    return config.load(this.controllerContainer)
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue()
  }
}
