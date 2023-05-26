import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpGet,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { GetUserFeatures } from '../../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { HomeServerFeaturesController } from './HomeServer/HomeServerFeaturesController'

@controller('/users/:userUuid/features')
export class InversifyExpressFeaturesController extends HomeServerFeaturesController {
  constructor(@inject(TYPES.Auth_GetUserFeatures) override doGetUserFeatures: GetUserFeatures) {
    super(doGetUserFeatures)
  }

  @httpGet('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async getFeatures(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getFeatures(request, response)
  }
}
