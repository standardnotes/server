import { inject } from 'inversify'
import { Request, Response } from 'express'
import {
  controller,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { CreateValetToken } from '../../Domain/UseCase/CreateValetToken/CreateValetToken'
import { HomeServerValetTokenController } from './HomeServer/HomeServerValetTokenController'

@controller('/valet-tokens', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
export class InversifyExpressValetTokenController extends HomeServerValetTokenController {
  constructor(@inject(TYPES.Auth_CreateValetToken) override createValetKey: CreateValetToken) {
    super(createValetKey)
  }

  @httpPost('/')
  override async create(request: Request, response: Response): Promise<results.JsonResult> {
    return super.create(request, response)
  }
}
