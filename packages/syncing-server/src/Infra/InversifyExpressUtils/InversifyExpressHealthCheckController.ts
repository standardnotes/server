import { controller, httpGet } from 'inversify-express-utils'

@controller('/healthcheck')
export class InversifyExpressHealthCheckController {
  @httpGet('/')
  public async get(): Promise<string> {
    return 'OK'
  }
}
