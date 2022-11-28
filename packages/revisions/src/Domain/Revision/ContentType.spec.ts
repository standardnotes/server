import { ContentType } from './ContentType'

describe('ContentType', () => {
  it('should create a value obejct', () => {
    const valueOrError = ContentType.create('Note')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).not.toBeNull()
  })

  it('should fail to create a value obejct', () => {
    const valueOrError = ContentType.create('test')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
