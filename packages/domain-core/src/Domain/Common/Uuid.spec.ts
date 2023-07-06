import { Uuid } from './Uuid'

describe('Uuid', () => {
  it('should create a value object', () => {
    const valueOrError = Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('84c0f8e8-544a-4c7e-9adf-26209303bc1d')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Uuid.create('1-2-3')

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should check equality between two value objects', () => {
    const uuid1 = Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue()
    const uuid2 = Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue()

    expect(uuid1.equals(uuid2)).toBeTruthy()
  })

  it('should check inequality between two value objects', () => {
    const uuid1 = Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue()
    const uuid2 = Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1e').getValue()

    expect(uuid1.equals(uuid2)).toBeFalsy()
  })

  it('should check inequality between two value objects of different types', () => {
    const uuid1 = Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue()

    expect(uuid1.equals(null as unknown as Uuid)).toBeFalsy()
    expect(uuid1.equals(undefined as unknown as Uuid)).toBeFalsy()
  })
})
