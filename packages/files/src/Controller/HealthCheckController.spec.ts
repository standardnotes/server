import 'reflect-metadata'

import { HealthCheckController } from './HealthCheckController'

describe('HealthCheckController', () => {
  const createController = () => new HealthCheckController()

  it('should return OK', async () => {
    const response = (await createController().get()) as string
    expect(response).toEqual('OK')
  })
})
