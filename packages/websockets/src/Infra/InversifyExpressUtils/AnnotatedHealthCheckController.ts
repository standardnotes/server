import { controller, httpGet } from 'inversify-express-utils'

@controller('/healthcheck')
export class AnnotatedHealthCheckController {
  @httpGet('/')
  public async get(): Promise<string> {
    return 'OK'
  }
}
