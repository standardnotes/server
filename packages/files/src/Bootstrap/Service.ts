import { ServiceContainerInterface, ServiceIdentifier, ServiceInterface } from '@standardnotes/domain-core'
import { DirectCallDomainEventPublisher } from '@standardnotes/domain-events-infra'

import { ContainerConfigLoader } from './Container'
import { Transform } from 'stream'

export class Service implements ServiceInterface {
  private logger: Transform | undefined

  constructor(
    private serviceContainer: ServiceContainerInterface,
    private directCallDomainEventPublisher: DirectCallDomainEventPublisher,
  ) {
    this.serviceContainer.register(this.getId(), this)
  }

  setLogger(logger: Transform): void {
    this.logger = logger
  }

  async handleRequest(_request: never, _response: never, _endpointOrMethodIdentifier: string): Promise<unknown> {
    throw new Error('Requests are handled via inversify-express at ApiGateway level')
  }

  async getContainer(): Promise<unknown> {
    const config = new ContainerConfigLoader()

    return config.load({
      directCallDomainEventPublisher: this.directCallDomainEventPublisher,
      logger: this.logger,
    })
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.Files).getValue()
  }
}
