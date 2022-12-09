// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('../../jest.config')
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  ...base,
  transform: {
    ...tsjPreset.transform,
  },
  coveragePathIgnorePatterns: ['/Bootstrap/', '/InversifyExpressUtils/', '/Domain/Email/', '/Domain/Event'],
  setupFilesAfterEnv: ['./test-setup.ts'],
}
