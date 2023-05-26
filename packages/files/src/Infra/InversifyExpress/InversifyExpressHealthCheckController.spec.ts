import 'reflect-metadata'

import { InversifyExpressHealthCheckController } from './InversifyExpressHealthCheckController'

describe('InversifyExpressHealthCheckController', () => {
  const createController = () => new InversifyExpressHealthCheckController()

  it('should return OK', async () => {
    const response = (await createController().get()) as string
    expect(response).toEqual('OK')
  })
})
