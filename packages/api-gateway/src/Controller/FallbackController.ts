import { BaseHttpController, all, controller, results } from 'inversify-express-utils'

@controller('')
export class FallbackController extends BaseHttpController {
  @all('*')
  public async fallback(): Promise<results.NotFoundResult> {
    return this.notFound()
  }
}
