// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('../../jest.config')
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  ...base,
  transform: {
    ...tsjPreset.transform,
  },
  coveragePathIgnorePatterns: ['/Bootstrap/', '/InversifyExpressUtils/', '/Infra/', '/Projection/', '/Domain/Email/'],
  setupFilesAfterEnv: ['./test-setup.ts'],
}
