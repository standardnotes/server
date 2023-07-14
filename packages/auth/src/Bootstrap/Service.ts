import {
  ControllerContainerInterface,
  Result,
  ServiceConfiguration,
  ServiceContainerInterface,
  ServiceIdentifier,
} from '@standardnotes/domain-core'

import { ContainerConfigLoader } from './Container'
import { DirectCallDomainEventPublisher } from '@standardnotes/domain-events-infra'
import TYPES from './Types'
import { Container } from 'inversify'
import { ActivatePremiumFeatures } from '../Domain/UseCase/ActivatePremiumFeatures/ActivatePremiumFeatures'
import { AuthServiceInterface } from './AuthServiceInterface'

export class Service implements AuthServiceInterface {
  private container: Container | undefined

  constructor(
    private serviceContainer: ServiceContainerInterface,
    private controllerContainer: ControllerContainerInterface,
    private directCallDomainEventPublisher: DirectCallDomainEventPublisher,
  ) {
    this.serviceContainer.register(this.getId(), this)
  }

  async activatePremiumFeatures(dto: {
    username: string
    subscriptionPlanName?: string
    endsAt?: Date
  }): Promise<Result<string>> {
    if (!this.container) {
      return Result.fail('Container not initialized')
    }

    const activatePremiumFeatures = this.container.get(TYPES.Auth_ActivatePremiumFeatures) as ActivatePremiumFeatures

    return activatePremiumFeatures.execute(dto)
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

    const container = await config.load({
      controllerConatiner: this.controllerContainer,
      directCallDomainEventPublisher: this.directCallDomainEventPublisher,
      logger: configuration?.logger,
      environmentOverrides: configuration?.environmentOverrides,
    })

    this.container = container

    return container
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue()
  }
}
