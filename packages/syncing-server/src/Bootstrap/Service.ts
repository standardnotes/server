import {
  ControllerContainerInterface,
  ServiceConfiguration,
  ServiceContainerInterface,
  ServiceIdentifier,
  ServiceInterface,
} from '@standardnotes/domain-core'

import { ContainerConfigLoader } from './Container'
import { DirectCallDomainEventPublisher } from '@standardnotes/domain-events-infra'

export class Service implements ServiceInterface {
  constructor(
    private serviceContainer: ServiceContainerInterface,
    private controllerContainer: ControllerContainerInterface,
    private directCallDomainEventPublisher: DirectCallDomainEventPublisher,
  ) {
    this.serviceContainer.register(this.getId(), this)
  }

  async handleRequest(request: never, response: never, endpointOrMethodIdentifier: string): Promise<unknown> {
    const method = this.controllerContainer.get(endpointOrMethodIdentifier)

    if (!method) {
      throw new Error(`Method ${endpointOrMethodIdentifier} not found`)
    }

    return method(request, response)
  }

  async getContainer(configuration?: ServiceConfiguration): Promise<unknown> {
    const config = new ContainerConfigLoader()

    return config.load({
      controllerConatiner: this.controllerContainer,
      directCallDomainEventPublisher: this.directCallDomainEventPublisher,
      logger: configuration?.logger,
      environmentOverrides: configuration?.environmentOverrides,
    })
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.SyncingServer).getValue()
  }
}
