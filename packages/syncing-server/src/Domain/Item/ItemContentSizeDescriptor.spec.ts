import { ItemContentSizeDescriptor } from './ItemContentSizeDescriptor'

describe('ItemContentSizeDescriptor', () => {
  it('should create a value object', () => {
    const valueOrError = ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 20)

    expect(valueOrError.isFailed()).toBeFalsy()
  })

  it('should return error if shared vault uuid is not valid', () => {
    const valueOrError = ItemContentSizeDescriptor.create('invalid', 20)

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
