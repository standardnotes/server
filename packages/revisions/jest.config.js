// eslint-disable-next-line @typescript-eslint/no-var-requires
const base = require('../../jest.config')
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  ...base,
  transform: {
    ...tsjPreset.transform,
  },
  coveragePathIgnorePatterns: ['/Bootstrap/', '/Controller/', 'HealthCheckController', '/Infra/', '/Mapping/'],
}
