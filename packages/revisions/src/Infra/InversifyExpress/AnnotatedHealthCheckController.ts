import { BaseHttpController, controller, httpGet } from 'inversify-express-utils'

@controller('/healthcheck')
export class AnnotatedHealthCheckController extends BaseHttpController {
  @httpGet('/')
  public async get(): Promise<string> {
    return 'OK'
  }
}
