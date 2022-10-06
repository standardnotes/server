// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('../../jest.config')
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  ...base,
  transform: {
    ...tsjPreset.transform,
  },
  coverageThreshold: {
    global: {
      branches: 14,
      functions: 13,
      lines: 14,
      statements: 14,
    },
  },
}
