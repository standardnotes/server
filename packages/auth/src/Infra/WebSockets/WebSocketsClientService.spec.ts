import 'reflect-metadata'

import { DomainEventPublisherInterface, UserRolesChangedEvent } from '@standardnotes/domain-events'
import { RoleName } from '@standardnotes/common'

import { User } from '../../Domain/User/User'
import { WebSocketsClientService } from './WebSocketsClientService'
import { DomainEventFactoryInterface } from '../../Domain/Event/DomainEventFactoryInterface'

describe('WebSocketsClientService', () => {
  let user: User
  let event: UserRolesChangedEvent
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface

  const createService = () => new WebSocketsClientService(domainEventFactory, domainEventPublisher)

  beforeEach(() => {
    user = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.ProUser,
        },
      ]),
    } as jest.Mocked<User>

    event = {} as jest.Mocked<UserRolesChangedEvent>

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createUserRolesChangedEvent = jest.fn().mockReturnValue(event)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should request a message about a user role changed', async () => {
    await createService().sendUserRolesChangedEvent(user)

    expect(domainEventFactory.createUserRolesChangedEvent).toHaveBeenCalledWith('123', 'test@test.com', [
      RoleName.ProUser,
    ])
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})
