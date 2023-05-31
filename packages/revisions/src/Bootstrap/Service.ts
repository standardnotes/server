import {
  ControllerContainerInterface,
  ServiceContainerInterface,
  ServiceIdentifier,
  ServiceInterface,
} from '@standardnotes/domain-core'

import { ContainerConfigLoader } from './Container'
import { DirectCallDomainEventPublisher } from '@standardnotes/domain-events-infra'
import { Transform } from 'stream'

export class Service implements ServiceInterface {
  private logger: Transform | undefined

  constructor(
    private serviceContainer: ServiceContainerInterface,
    private controllerContainer: ControllerContainerInterface,
    private directCallDomainEventPublisher: DirectCallDomainEventPublisher,
  ) {
    this.serviceContainer.register(this.getId(), this)
  }

  setLogger(logger: Transform): void {
    this.logger = logger
  }

  async handleRequest(request: never, response: never, endpointOrMethodIdentifier: string): Promise<unknown> {
    const method = this.controllerContainer.get(endpointOrMethodIdentifier)

    if (!method) {
      throw new Error(`Method ${endpointOrMethodIdentifier} not found`)
    }

    return method(request, response)
  }

  async getContainer(): Promise<unknown> {
    const config = new ContainerConfigLoader()

    return config.load({
      controllerConatiner: this.controllerContainer,
      directCallDomainEventPublisher: this.directCallDomainEventPublisher,
      logger: this.logger,
    })
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.Revisions).getValue()
  }
}
