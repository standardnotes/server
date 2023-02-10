import { httpGet } from 'inversify-express-utils'

export class InversifyExpressHealthCheckController {
  @httpGet('/healthcheck/')
  public async get(): Promise<string> {
    return 'OK'
  }
}
