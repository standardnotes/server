// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('../../jest.config')
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  ...base,
  transform: {
    ...tsjPreset.transform,
  },
  coveragePathIgnorePatterns: ['/Bootstrap/', 'HealthCheckController', '/Infra/FS', '/Domain/Event/'],
  setupFilesAfterEnv: ['./test-setup.ts'],
}
