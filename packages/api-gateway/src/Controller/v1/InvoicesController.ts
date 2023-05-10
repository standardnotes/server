import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'
import { inject } from 'inversify'
import { TYPES } from '../../Bootstrap/Types'
import { ServiceProxyInterface } from '../../Service/Http/ServiceProxyInterface'

@controller('/v1')
export class InvoicesController extends BaseHttpController {
  constructor(@inject(TYPES.HTTPService) private httpService: ServiceProxyInterface) {
    super()
  }

  @httpPost('/invoices/send-latest', TYPES.SubscriptionTokenAuthMiddleware)
  async sendLatestInvoice(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/pro_users/send-invoice', request.body)
  }
}
