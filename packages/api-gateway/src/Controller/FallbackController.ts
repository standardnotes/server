import { Request, Response } from 'express'
import { BaseHttpController, all, controller, results } from 'inversify-express-utils'

@controller('')
export class FallbackController extends BaseHttpController {
  @all('*')
  public async fallback(request: Request, response: Response): Promise<void | results.NotFoundResult> {
    if (request.path === '/' && request.method === 'GET') {
      response.send(
        '<!DOCTYPE html><html lang="en"><head><meta name="robots" content="noindex"></head><body>Your home server is up and running! Enter the URL of this page into Standard Notes when registering or signing in to begin using your home server.</body></html>',
      )

      return
    }

    return this.notFound()
  }
}
