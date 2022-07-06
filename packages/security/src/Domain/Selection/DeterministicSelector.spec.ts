import { DeterministicSelector } from './DeterministicSelector'

describe('DeterministicSelector', () => {
  const createSelector = () => new DeterministicSelector<string>()

  it('should choose always the same value based on the same input', () => {
    const selector = createSelector()

    const inputString = '875a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67'

    const allowedValues = ['a', 'b', 'c', 'd', 'e']

    const firstValue = selector.select(inputString, allowedValues)

    const secondValue = selector.select(inputString, allowedValues)

    expect(firstValue).toEqual('d')

    expect(firstValue).toEqual(secondValue)
  })

  it('should choose different values on different input', () => {
    const selector = createSelector()

    const allowedValues = ['a', 'b', 'c', 'd', 'e']

    const firstValue = selector.select(
      '875a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67',
      allowedValues,
    )

    const secondValue = selector.select(
      'a75a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67',
      allowedValues,
    )

    expect(firstValue).toEqual('d')

    expect(secondValue).toEqual('e')
  })
})
