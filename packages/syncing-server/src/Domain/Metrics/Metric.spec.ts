import { Metric } from './Metric'

describe('Metric', () => {
  it('should create a value object', () => {
    const valueOrError = Metric.create({ name: 'ItemCreated', timestamp: 0 })

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().props.name).toEqual('ItemCreated')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Metric.create({ name: 'InvalidMetricName', timestamp: 0 })

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
