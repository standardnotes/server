import 'reflect-metadata'

import { UserRequestType } from '@standardnotes/common'

import { ProcessUserRequest } from '../Domain/UseCase/ProcessUserRequest/ProcessUserRequest'

import { UserRequestsController } from './UserRequestsController'

describe('UserRequestsController', () => {
  let processUserRequest: ProcessUserRequest

  const createController = () => new UserRequestsController(processUserRequest)

  beforeEach(() => {
    processUserRequest = {} as jest.Mocked<ProcessUserRequest>
    processUserRequest.execute = jest.fn().mockReturnValue({ success: true })
  })

  it('should process user request', async () => {
    expect(
      await createController().submitUserRequest({
        userUuid: '1-2-3',
        requestType: UserRequestType.ExitDiscount,
      }),
    ).toEqual({
      status: 200,
      data: { success: true },
    })
  })

  it('should not process user request', async () => {
    processUserRequest.execute = jest.fn().mockReturnValue({ success: false })
    expect(
      await createController().submitUserRequest({
        userUuid: '1-2-3',
        requestType: UserRequestType.ExitDiscount,
      }),
    ).toEqual({
      status: 400,
      data: { success: false },
    })
  })
})
