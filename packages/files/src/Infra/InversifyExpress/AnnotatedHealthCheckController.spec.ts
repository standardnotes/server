import 'reflect-metadata'

import { AnnotatedHealthCheckController } from './AnnotatedHealthCheckController'

describe('AnnotatedHealthCheckController', () => {
  const createController = () => new AnnotatedHealthCheckController()

  it('should return OK', async () => {
    const response = (await createController().get()) as string
    expect(response).toEqual('OK')
  })
})
