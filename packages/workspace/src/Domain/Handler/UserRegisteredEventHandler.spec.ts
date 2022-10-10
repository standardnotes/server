import 'reflect-metadata'

import { UserRegisteredEvent } from '@standardnotes/domain-events'

import { UserRegisteredEventHandler } from './UserRegisteredEventHandler'
import { CreateWorkspace } from '../UseCase/CreateWorkspace/CreateWorkspace'
import { ProtocolVersion } from '@standardnotes/common'

describe('UserRegisteredEventHandler', () => {
  let createWorkspace: CreateWorkspace
  let event: UserRegisteredEvent

  const createHandler = () => new UserRegisteredEventHandler(createWorkspace)

  beforeEach(() => {
    createWorkspace = {} as jest.Mocked<CreateWorkspace>
    createWorkspace.execute = jest.fn()

    event = {} as jest.Mocked<UserRegisteredEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      email: 'test@test.te',
      protocolVersion: ProtocolVersion.V005,
    }
  })

  it('should create a root workspace for newly registered user', async () => {
    await createHandler().handle(event)

    expect(createWorkspace.execute).toHaveBeenCalledWith({
      ownerUuid: '1-2-3',
      type: 'root',
    })
  })

  it('should not create a root workspace for newly registered user on legacy protocols', async () => {
    event.payload.protocolVersion = ProtocolVersion.V004

    await createHandler().handle(event)

    expect(createWorkspace.execute).not.toHaveBeenCalled()
  })
})
