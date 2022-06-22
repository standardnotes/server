import { controller, httpGet } from 'inversify-express-utils'

@controller('/healthcheck')
export class HealthCheckController {
  @httpGet('/')
  public async get(): Promise<string> {
    return 'OK'
  }
}
