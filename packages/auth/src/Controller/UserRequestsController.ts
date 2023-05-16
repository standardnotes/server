import { UserRequestRequestParams, UserRequestResponseBody, UserRequestServerInterface } from '@standardnotes/api'
import { HttpResponse, HttpStatusCode } from '@standardnotes/responses'
import { inject, injectable } from 'inversify'
import TYPES from '../Bootstrap/Types'
import { ProcessUserRequest } from '../Domain/UseCase/ProcessUserRequest/ProcessUserRequest'

@injectable()
export class UserRequestsController implements UserRequestServerInterface {
  constructor(@inject(TYPES.Auth_ProcessUserRequest) private processUserRequest: ProcessUserRequest) {}

  async submitUserRequest(params: UserRequestRequestParams): Promise<HttpResponse<UserRequestResponseBody>> {
    const result = await this.processUserRequest.execute({
      requestType: params.requestType,
      userEmail: params.userEmail as string,
      userUuid: params.userUuid,
    })

    if (!result.success) {
      return {
        status: HttpStatusCode.BadRequest,
        data: result,
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: result,
    }
  }
}
