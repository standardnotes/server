import { Request, Response } from 'express'
import { inject } from 'inversify'
import { controller, all, BaseHttpController, httpPost, httpGet, results, httpDelete } from 'inversify-express-utils'
import { TYPES } from '../Bootstrap/Types'
import { ServiceProxyInterface } from '../Service/Proxy/ServiceProxyInterface'

@controller('')
export class LegacyController extends BaseHttpController {
  private AUTH_ROUTES: Map<string, string>
  private PARAMETRIZED_AUTH_ROUTES: Map<string, string>

  constructor(@inject(TYPES.ApiGateway_ServiceProxy) private httpService: ServiceProxyInterface) {
    super()

    this.AUTH_ROUTES = new Map([
      ['POST:/auth', 'POST:auth'],
      ['POST:/auth/sign_out', 'POST:auth/sign_out'],
      ['POST:/auth/change_pw', 'PUT:/users/legacy-endpoint-user/attributes/credentials'],
      ['GET:/sessions', 'GET:sessions'],
      ['DELETE:/session', 'DELETE:session'],
      ['DELETE:/session/all', 'DELETE:session/all'],
      ['POST:/session/refresh', 'POST:session/refresh'],
      ['POST:/auth/sign_in', 'POST:auth/sign_in'],
      ['GET:/auth/params', 'GET:auth/params'],
    ])

    this.PARAMETRIZED_AUTH_ROUTES = new Map([
      ['PATCH:/users/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})', 'users/{uuid}'],
    ])
  }

  @httpPost('/items/sync', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async legacyItemsSync(request: Request, response: Response): Promise<void> {
    await this.httpService.callLegacySyncingServer(request, response, request.path.substring(1), request.body)
  }

  @httpGet('/items/:item_id/revisions', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async legacyGetRevisions(request: Request, response: Response): Promise<void> {
    await this.httpService.callLegacySyncingServer(request, response, request.path.substring(1), request.body)
  }

  @httpGet('/items/:item_id/revisions/:id', TYPES.ApiGateway_RequiredCrossServiceTokenMiddleware)
  async legacyGetRevision(request: Request, response: Response): Promise<void> {
    await this.httpService.callLegacySyncingServer(request, response, request.path.substring(1), request.body)
  }

  @httpGet('/items/mfa/:userUuid')
  async blockedMFARequest(): Promise<results.StatusCodeResult> {
    return this.statusCode(401)
  }

  @httpDelete('/items/mfa/:userUuid')
  async blockedMFARemoveRequest(): Promise<results.StatusCodeResult> {
    return this.statusCode(401)
  }

  @all('*')
  async legacyProxyToSyncingServer(request: Request, response: Response): Promise<void> {
    if (request.path === '/') {
      response.send(
        '<!DOCTYPE html><html lang="en"><head><meta name="robots" content="noindex"></head><body>Welcome to the Standard Notes server infrastructure. Learn more at https://docs.standardnotes.com</body></html>',
      )

      return
    }

    if (this.shouldBeRedirectedToAuthService(request)) {
      const methodAndPath = this.getMethodAndPath(request)

      request.method = methodAndPath.method
      await this.httpService.callAuthServerWithLegacyFormat(request, response, methodAndPath.path, request.body)

      return
    }

    await this.httpService.callLegacySyncingServer(request, response, request.path.substring(1), request.body)
  }

  private getMethodAndPath(request: Request): { method: string; path: string } {
    const requestKey = `${request.method}:${request.path}`

    if (this.AUTH_ROUTES.has(requestKey)) {
      const legacyRoute = this.AUTH_ROUTES.get(requestKey) as string
      const legacyRouteMethodAndPath = legacyRoute.split(':')

      return {
        method: legacyRouteMethodAndPath[0],
        path: legacyRouteMethodAndPath[1],
      }
    }

    for (const key of this.AUTH_ROUTES.keys()) {
      const regExp = new RegExp(key)
      const matches = regExp.exec(requestKey)
      if (matches !== null) {
        const legacyRoute = (this.AUTH_ROUTES.get(key) as string).replace('{uuid}', matches[1])
        const legacyRouteMethodAndPath = legacyRoute.split(':')

        return {
          method: legacyRouteMethodAndPath[0],
          path: legacyRouteMethodAndPath[1],
        }
      }
    }

    throw Error('could not find path for key')
  }

  private shouldBeRedirectedToAuthService(request: Request): boolean {
    const requestKey = `${request.method}:${request.path}`

    if (this.AUTH_ROUTES.has(requestKey)) {
      return true
    }

    for (const key of this.PARAMETRIZED_AUTH_ROUTES.keys()) {
      const regExp = new RegExp(key)
      const matches = regExp.test(requestKey)
      if (matches) {
        return true
      }
    }

    return false
  }
}
