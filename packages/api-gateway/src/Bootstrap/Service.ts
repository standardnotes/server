import { ServiceContainerInterface, ServiceIdentifier, ServiceInterface } from '@standardnotes/domain-core'

import { ContainerConfigLoader } from './Container'
import { Transform } from 'stream'

export class Service implements ServiceInterface {
  private logger: Transform | undefined

  constructor(private serviceContainer: ServiceContainerInterface) {
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
      serviceContainer: this.serviceContainer,
      logger: this.logger,
    })
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue()
  }
}
