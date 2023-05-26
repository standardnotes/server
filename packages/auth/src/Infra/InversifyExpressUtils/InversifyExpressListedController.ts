import { inject } from 'inversify'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { controller, httpPost, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import TYPES from '../../Bootstrap/Types'
import { CreateListedAccount } from '../../Domain/UseCase/CreateListedAccount/CreateListedAccount'
import { HomeServerListedController } from './HomeServer/HomeServerListedController'

@controller('/listed')
export class InversifyExpressListedController extends HomeServerListedController {
  constructor(@inject(TYPES.Auth_CreateListedAccount) override doCreateListedAccount: CreateListedAccount) {
    super(doCreateListedAccount)
  }

  @httpPost('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async createListedAccount(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.createListedAccount(_request, response)
  }
}
