import { BaseHttpController, controller, httpGet } from 'inversify-express-utils'

@controller('/healthcheck')
export class InversifyExpressHealthCheckController extends BaseHttpController {
  @httpGet('/')
  public async get(): Promise<string> {
    return 'OK'
  }
}
