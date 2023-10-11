# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.18.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.18.1...@standardnotes/domain-events-infra@1.18.2) (2023-10-11)

### Bug Fixes

* **domain-events-infra:** logs severity ([1d28002](https://github.com/standardnotes/server/commit/1d280028a65b7ba1925e27b471d98961e16b0974))

## [1.18.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.18.0...@standardnotes/domain-events-infra@1.18.1) (2023-10-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

# [1.18.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.17.0...@standardnotes/domain-events-infra@1.18.0) (2023-10-11)

### Features

* add opentelemetry for scheduled tasks ([443235a](https://github.com/standardnotes/server/commit/443235a861181acf708d98fba25ce6d79f198b56))

# [1.17.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.16.4...@standardnotes/domain-events-infra@1.17.0) (2023-10-10)

### Features

* remove newrelic integration ([#862](https://github.com/standardnotes/server/issues/862)) ([efb341e](https://github.com/standardnotes/server/commit/efb341eb991d37efab7c1efce035ee07ad0a101e))

## [1.16.4](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.16.3...@standardnotes/domain-events-infra@1.16.4) (2023-10-10)

### Bug Fixes

* **syncing-server:** add option to define otel ratio ([c021bb3](https://github.com/standardnotes/server/commit/c021bb3d7ca90179292e7c75f5a84bf2b941ce86))

## [1.16.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.16.2...@standardnotes/domain-events-infra@1.16.3) (2023-10-09)

### Bug Fixes

* **domain-events-infra:** add parent context on internal span ([099c6e1](https://github.com/standardnotes/server/commit/099c6e10c69b6b81006f59bcdb35325b545ab39c))

### Reverts

* Revert "Revert "fix: setting parent span on workers"" ([76ae6f5](https://github.com/standardnotes/server/commit/76ae6f5a882a82ab5f635452e3bc7b2b16709531))

## [1.16.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.16.1...@standardnotes/domain-events-infra@1.16.2) (2023-10-09)

### Reverts

* Revert "fix: setting parent span on workers" ([3fc07a5](https://github.com/standardnotes/server/commit/3fc07a5b60c26b583efd88e8a80d4c4321e71efb))

## [1.16.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.16.0...@standardnotes/domain-events-infra@1.16.1) (2023-10-09)

### Bug Fixes

* setting parent span on workers ([1c54d18](https://github.com/standardnotes/server/commit/1c54d18c3ca75353701ba921492a5ecfaa2e3572))

# [1.16.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.15.0...@standardnotes/domain-events-infra@1.16.0) (2023-10-09)

### Features

* add custom tracing on workers ([65ced2c](https://github.com/standardnotes/server/commit/65ced2cc7b0686dc8af5cdad499412fc8fd29d1d))
* **domain-events-infra:** add express instrumentation ([b47c80c](https://github.com/standardnotes/server/commit/b47c80cccd23af5d2ad375ef535a38f57362b8d0))
* **domain-events-infra:** add ioredis instrumentation ([b72e515](https://github.com/standardnotes/server/commit/b72e515931f5ea874494fa88be7dcee7ad693b3f))
* **domain-events-infra:** add winston instrumentation ([65fcc65](https://github.com/standardnotes/server/commit/65fcc657a77790c7f1b9b4a872ff59152e56bbc7))

# [1.15.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.9...@standardnotes/domain-events-infra@1.15.0) (2023-10-09)

### Features

* add opentelemetry to all services ([5e930d0](https://github.com/standardnotes/server/commit/5e930d08eb60a0da800081342315e7edaf130951))

## [1.14.9](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.8...@standardnotes/domain-events-infra@1.14.9) (2023-10-09)

### Bug Fixes

* remove xray sdk in favor of opentelemetry ([b736dab](https://github.com/standardnotes/server/commit/b736dab3c1f76c9e03c4bc7bbf153dcb3309b7cb))

## [1.14.8](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.7...@standardnotes/domain-events-infra@1.14.8) (2023-10-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.14.7](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.6...@standardnotes/domain-events-infra@1.14.7) (2023-10-05)

### Reverts

* Revert "fix(domain-events-infra): setting user metadata on workers" ([cd37c95](https://github.com/standardnotes/server/commit/cd37c951bbec0f1bf6443792db961efd27380eac))

## [1.14.6](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.5...@standardnotes/domain-events-infra@1.14.6) (2023-10-05)

### Bug Fixes

* **domain-events-infra:** setting user metadata on workers ([c4b6f17](https://github.com/standardnotes/server/commit/c4b6f17ebcfe7bd77b6741f881a0d1f13ba809a4))

## [1.14.5](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.4...@standardnotes/domain-events-infra@1.14.5) (2023-10-04)

### Bug Fixes

* identifying services in workers ([eab78b3](https://github.com/standardnotes/server/commit/eab78b3a95ec82cb779d069d172169bfa92368c9))

## [1.14.4](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.3...@standardnotes/domain-events-infra@1.14.4) (2023-10-04)

### Bug Fixes

* **domain-events-infra:** subsegment name ([ba7cbb9](https://github.com/standardnotes/server/commit/ba7cbb989ba3592ea0c13fc39f85e314517fbb2d))

## [1.14.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.2...@standardnotes/domain-events-infra@1.14.3) (2023-10-04)

### Bug Fixes

* **domain-events-infra:** handling segments ([207ef9f](https://github.com/standardnotes/server/commit/207ef9f3e531b730f3f4869fb128354dbd659f46))
* **domain-events-infra:** remove redundant flush ([64f1fe5](https://github.com/standardnotes/server/commit/64f1fe59c23894bda9ad40c6bdeaf2997a8b48ce))

## [1.14.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.1...@standardnotes/domain-events-infra@1.14.2) (2023-10-04)

### Bug Fixes

* **domain-events-infra:** handling async functions ([f6bc1c3](https://github.com/standardnotes/server/commit/f6bc1c30846ecfb159f7fb1cdd8bfc3ab15b2dde))
* **domain-events-infra:** imports ([7668713](https://github.com/standardnotes/server/commit/7668713dd6f65b65e546152828f5f52ea34f8bf5))

## [1.14.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.14.0...@standardnotes/domain-events-infra@1.14.1) (2023-10-03)

### Bug Fixes

* **domain-events-infra:** change segment closing ([e066b6a](https://github.com/standardnotes/server/commit/e066b6a126754e5b1ea73b8ef5ce9068dc424d77))

# [1.14.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.13.1...@standardnotes/domain-events-infra@1.14.0) (2023-10-03)

### Features

* add xray segment tracing on auth-worker ([b1b244a](https://github.com/standardnotes/server/commit/b1b244a2cf1e17ddf67fc9b238b4b25a1bc5a190))

## [1.13.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.13.0...@standardnotes/domain-events-infra@1.13.1) (2023-09-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

# [1.13.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.34...@standardnotes/domain-events-infra@1.13.0) (2023-09-26)

### Features

* refactor handling revision creation from dump ([#854](https://github.com/standardnotes/server/issues/854)) ([ca6dbc0](https://github.com/standardnotes/server/commit/ca6dbc00537bb20f508f9310b1a838421f53a643))

## [1.12.34](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.33...@standardnotes/domain-events-infra@1.12.34) (2023-09-25)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.33](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.32...@standardnotes/domain-events-infra@1.12.33) (2023-09-25)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.32](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.31...@standardnotes/domain-events-infra@1.12.32) (2023-09-21)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.31](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.30...@standardnotes/domain-events-infra@1.12.31) (2023-09-20)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.30](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.29...@standardnotes/domain-events-infra@1.12.30) (2023-09-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.29](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.28...@standardnotes/domain-events-infra@1.12.29) (2023-09-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.28](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.27...@standardnotes/domain-events-infra@1.12.28) (2023-09-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.27](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.26...@standardnotes/domain-events-infra@1.12.27) (2023-09-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.26](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.25...@standardnotes/domain-events-infra@1.12.26) (2023-09-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.25](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.24...@standardnotes/domain-events-infra@1.12.25) (2023-09-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.24](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.23...@standardnotes/domain-events-infra@1.12.24) (2023-09-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.23](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.22...@standardnotes/domain-events-infra@1.12.23) (2023-09-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.22](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.21...@standardnotes/domain-events-infra@1.12.22) (2023-09-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.21](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.20...@standardnotes/domain-events-infra@1.12.21) (2023-09-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.20](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.19...@standardnotes/domain-events-infra@1.12.20) (2023-09-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.19](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.18...@standardnotes/domain-events-infra@1.12.19) (2023-09-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.18](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.17...@standardnotes/domain-events-infra@1.12.18) (2023-09-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.17](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.16...@standardnotes/domain-events-infra@1.12.17) (2023-08-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.16](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.15...@standardnotes/domain-events-infra@1.12.16) (2023-08-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.15](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.14...@standardnotes/domain-events-infra@1.12.15) (2023-08-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.14](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.13...@standardnotes/domain-events-infra@1.12.14) (2023-08-24)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.13](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.12...@standardnotes/domain-events-infra@1.12.13) (2023-08-23)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.12](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.11...@standardnotes/domain-events-infra@1.12.12) (2023-08-22)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.11](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.10...@standardnotes/domain-events-infra@1.12.11) (2023-08-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.10](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.9...@standardnotes/domain-events-infra@1.12.10) (2023-08-03)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.9](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.8...@standardnotes/domain-events-infra@1.12.9) (2023-07-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.8](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.7...@standardnotes/domain-events-infra@1.12.8) (2023-07-05)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.7](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.6...@standardnotes/domain-events-infra@1.12.7) (2023-06-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.6](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.5...@standardnotes/domain-events-infra@1.12.6) (2023-06-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.5](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.4...@standardnotes/domain-events-infra@1.12.5) (2023-06-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.4](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.3...@standardnotes/domain-events-infra@1.12.4) (2023-06-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.2...@standardnotes/domain-events-infra@1.12.3) (2023-05-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.12.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.12.0...@standardnotes/domain-events-infra@1.12.2) (2023-05-30)

### Bug Fixes

* bump version manually to publish packages ([b0d01df](https://github.com/standardnotes/server/commit/b0d01dffd91557c67eac2940d9270bca208c1128))

# [1.12.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.11.2...@standardnotes/domain-events-infra@1.12.0) (2023-05-17)

### Features

* add direct event handling for home server ([#608](https://github.com/standardnotes/server/issues/608)) ([8a47d81](https://github.com/standardnotes/server/commit/8a47d81936acd765224e74fd083810579a83c9a7))

## [1.11.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.11.1...@standardnotes/domain-events-infra@1.11.2) (2023-05-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.11.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.11.0...@standardnotes/domain-events-infra@1.11.1) (2023-05-09)

### Bug Fixes

* node engine version requirement in package.json files ([62a0e89](https://github.com/standardnotes/server/commit/62a0e89748ab306566c4aa10b9dc0385fb0f1684))

# [1.11.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.10.3...@standardnotes/domain-events-infra@1.11.0) (2023-05-08)

### Features

* upgrade to node 20.1.0 ([#590](https://github.com/standardnotes/server/issues/590)) ([8fbb94d](https://github.com/standardnotes/server/commit/8fbb94d15ab664cca775ec71d51db465547c35ee))

## [1.10.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.10.2...@standardnotes/domain-events-infra@1.10.3) (2023-05-05)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.10.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.10.1...@standardnotes/domain-events-infra@1.10.2) (2023-04-27)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.10.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.10.0...@standardnotes/domain-events-infra@1.10.1) (2023-04-21)

**Note:** Version bump only for package @standardnotes/domain-events-infra

# [1.10.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.74...@standardnotes/domain-events-infra@1.10.0) (2023-04-21)

### Features

* **domain-events-infra:** add SES email bounce notifications handler ([#569](https://github.com/standardnotes/server/issues/569)) ([9b9f10d](https://github.com/standardnotes/server/commit/9b9f10d4ca9ceef1defa868b7c96f570e46d8053))

## [1.9.74](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.73...@standardnotes/domain-events-infra@1.9.74) (2023-03-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.73](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.72...@standardnotes/domain-events-infra@1.9.73) (2023-03-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.72](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.71...@standardnotes/domain-events-infra@1.9.72) (2023-02-23)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.71](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.70...@standardnotes/domain-events-infra@1.9.71) (2023-02-23)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.70](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.69...@standardnotes/domain-events-infra@1.9.70) (2023-02-21)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.69](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.68...@standardnotes/domain-events-infra@1.9.69) (2023-02-20)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.68](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.67...@standardnotes/domain-events-infra@1.9.68) (2023-01-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.67](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.66...@standardnotes/domain-events-infra@1.9.67) (2023-01-20)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.66](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.65...@standardnotes/domain-events-infra@1.9.66) (2023-01-20)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.65](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.64...@standardnotes/domain-events-infra@1.9.65) (2023-01-19)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.64](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.63...@standardnotes/domain-events-infra@1.9.64) (2023-01-19)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.63](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.62...@standardnotes/domain-events-infra@1.9.63) (2023-01-19)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.62](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.61...@standardnotes/domain-events-infra@1.9.62) (2023-01-19)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.61](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.60...@standardnotes/domain-events-infra@1.9.61) (2023-01-18)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.60](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.59...@standardnotes/domain-events-infra@1.9.60) (2023-01-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.59](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.58...@standardnotes/domain-events-infra@1.9.59) (2022-12-20)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.58](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.57...@standardnotes/domain-events-infra@1.9.58) (2022-12-19)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.57](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.56...@standardnotes/domain-events-infra@1.9.57) (2022-12-19)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.56](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.55...@standardnotes/domain-events-infra@1.9.56) (2022-12-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.55](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.54...@standardnotes/domain-events-infra@1.9.55) (2022-12-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.54](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.53...@standardnotes/domain-events-infra@1.9.54) (2022-12-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.53](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.52...@standardnotes/domain-events-infra@1.9.53) (2022-12-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.52](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.51...@standardnotes/domain-events-infra@1.9.52) (2022-12-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.51](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.50...@standardnotes/domain-events-infra@1.9.51) (2022-12-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.50](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.49...@standardnotes/domain-events-infra@1.9.50) (2022-12-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.49](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.48...@standardnotes/domain-events-infra@1.9.49) (2022-12-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.48](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.47...@standardnotes/domain-events-infra@1.9.48) (2022-12-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.47](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.46...@standardnotes/domain-events-infra@1.9.47) (2022-12-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.46](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.45...@standardnotes/domain-events-infra@1.9.46) (2022-12-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.45](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.44...@standardnotes/domain-events-infra@1.9.45) (2022-12-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.44](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.43...@standardnotes/domain-events-infra@1.9.44) (2022-12-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.43](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.42...@standardnotes/domain-events-infra@1.9.43) (2022-12-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.42](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.41...@standardnotes/domain-events-infra@1.9.42) (2022-12-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.41](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.40...@standardnotes/domain-events-infra@1.9.41) (2022-12-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.40](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.39...@standardnotes/domain-events-infra@1.9.40) (2022-12-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.39](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.38...@standardnotes/domain-events-infra@1.9.39) (2022-12-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.38](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.37...@standardnotes/domain-events-infra@1.9.38) (2022-12-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.37](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.36...@standardnotes/domain-events-infra@1.9.37) (2022-12-05)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.36](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.35...@standardnotes/domain-events-infra@1.9.36) (2022-11-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.35](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.34...@standardnotes/domain-events-infra@1.9.35) (2022-11-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.34](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.33...@standardnotes/domain-events-infra@1.9.34) (2022-11-25)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.33](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.32...@standardnotes/domain-events-infra@1.9.33) (2022-11-24)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.32](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.31...@standardnotes/domain-events-infra@1.9.32) (2022-11-23)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.31](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.30...@standardnotes/domain-events-infra@1.9.31) (2022-11-22)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.30](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.29...@standardnotes/domain-events-infra@1.9.30) (2022-11-21)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.29](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.28...@standardnotes/domain-events-infra@1.9.29) (2022-11-18)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.28](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.27...@standardnotes/domain-events-infra@1.9.28) (2022-11-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.27](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.26...@standardnotes/domain-events-infra@1.9.27) (2022-11-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.26](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.23...@standardnotes/domain-events-infra@1.9.26) (2022-11-14)

### Bug Fixes

* versioning issue ([7ca377f](https://github.com/standardnotes/server/commit/7ca377f1b889379e6a43a66c0134bf266763516d))

## [1.9.23](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.22...@standardnotes/domain-events-infra@1.9.23) (2022-11-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.22](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.21...@standardnotes/domain-events-infra@1.9.22) (2022-11-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.21](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.20...@standardnotes/domain-events-infra@1.9.21) (2022-11-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.20](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.19...@standardnotes/domain-events-infra@1.9.20) (2022-11-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.19](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.18...@standardnotes/domain-events-infra@1.9.19) (2022-11-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.18](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.17...@standardnotes/domain-events-infra@1.9.18) (2022-11-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.17](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.16...@standardnotes/domain-events-infra@1.9.17) (2022-11-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.16](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.15...@standardnotes/domain-events-infra@1.9.16) (2022-11-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.15](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.14...@standardnotes/domain-events-infra@1.9.15) (2022-11-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.14](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.13...@standardnotes/domain-events-infra@1.9.14) (2022-11-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.13](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.12...@standardnotes/domain-events-infra@1.9.13) (2022-11-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.12](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.11...@standardnotes/domain-events-infra@1.9.12) (2022-11-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.11](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.10...@standardnotes/domain-events-infra@1.9.11) (2022-11-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.10](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.9...@standardnotes/domain-events-infra@1.9.10) (2022-11-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.9](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.8...@standardnotes/domain-events-infra@1.9.9) (2022-11-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.8](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.7...@standardnotes/domain-events-infra@1.9.8) (2022-11-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.7](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.6...@standardnotes/domain-events-infra@1.9.7) (2022-11-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.6](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.5...@standardnotes/domain-events-infra@1.9.6) (2022-11-03)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.5](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.4...@standardnotes/domain-events-infra@1.9.5) (2022-11-02)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.4](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.3...@standardnotes/domain-events-infra@1.9.4) (2022-11-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.2...@standardnotes/domain-events-infra@1.9.3) (2022-10-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.1...@standardnotes/domain-events-infra@1.9.2) (2022-10-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.9.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.9.0...@standardnotes/domain-events-infra@1.9.1) (2022-10-26)

**Note:** Version bump only for package @standardnotes/domain-events-infra

# [1.9.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.27...@standardnotes/domain-events-infra@1.9.0) (2022-10-19)

### Features

* building server applications in ARM64 architecture for Docker ([fd92866](https://github.com/standardnotes/server/commit/fd92866ba1a86b22769b23cc4c8387a83f87979a))

## [1.8.27](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.26...@standardnotes/domain-events-infra@1.8.27) (2022-10-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.26](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.25...@standardnotes/domain-events-infra@1.8.26) (2022-10-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.25](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.24...@standardnotes/domain-events-infra@1.8.25) (2022-10-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.24](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.23...@standardnotes/domain-events-infra@1.8.24) (2022-10-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.23](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.22...@standardnotes/domain-events-infra@1.8.23) (2022-10-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.22](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.21...@standardnotes/domain-events-infra@1.8.22) (2022-10-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.21](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.20...@standardnotes/domain-events-infra@1.8.21) (2022-10-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.20](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.19...@standardnotes/domain-events-infra@1.8.20) (2022-10-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.19](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.18...@standardnotes/domain-events-infra@1.8.19) (2022-10-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.18](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.17...@standardnotes/domain-events-infra@1.8.18) (2022-10-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.17](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.16...@standardnotes/domain-events-infra@1.8.17) (2022-10-05)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.16](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.15...@standardnotes/domain-events-infra@1.8.16) (2022-10-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.15](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.14...@standardnotes/domain-events-infra@1.8.15) (2022-10-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.14](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.13...@standardnotes/domain-events-infra@1.8.14) (2022-10-03)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.13](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.12...@standardnotes/domain-events-infra@1.8.13) (2022-09-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.12](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.11...@standardnotes/domain-events-infra@1.8.12) (2022-09-21)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.11](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.10...@standardnotes/domain-events-infra@1.8.11) (2022-09-19)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.10](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.9...@standardnotes/domain-events-infra@1.8.10) (2022-09-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.9](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.8...@standardnotes/domain-events-infra@1.8.9) (2022-09-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.8](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.7...@standardnotes/domain-events-infra@1.8.8) (2022-09-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.7](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.6...@standardnotes/domain-events-infra@1.8.7) (2022-09-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.6](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.5...@standardnotes/domain-events-infra@1.8.6) (2022-09-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.5](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.4...@standardnotes/domain-events-infra@1.8.5) (2022-09-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.4](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.3...@standardnotes/domain-events-infra@1.8.4) (2022-09-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.2...@standardnotes/domain-events-infra@1.8.3) (2022-09-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.1...@standardnotes/domain-events-infra@1.8.2) (2022-09-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.8.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.8.0...@standardnotes/domain-events-infra@1.8.1) (2022-09-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

# [1.8.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.37...@standardnotes/domain-events-infra@1.8.0) (2022-09-05)

### Features

* **auth:** add keeping stats on payments ([0c176b7](https://github.com/standardnotes/server/commit/0c176b70f8281e1e490224b9c7ab85f272a3d4e9))

## [1.7.37](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.36...@standardnotes/domain-events-infra@1.7.37) (2022-09-05)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.36](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.35...@standardnotes/domain-events-infra@1.7.36) (2022-09-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.35](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.34...@standardnotes/domain-events-infra@1.7.35) (2022-09-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.34](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.33...@standardnotes/domain-events-infra@1.7.34) (2022-08-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.33](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.32...@standardnotes/domain-events-infra@1.7.33) (2022-08-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.32](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.31...@standardnotes/domain-events-infra@1.7.32) (2022-08-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.31](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.30...@standardnotes/domain-events-infra@1.7.31) (2022-08-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.30](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.29...@standardnotes/domain-events-infra@1.7.30) (2022-08-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.29](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.28...@standardnotes/domain-events-infra@1.7.29) (2022-08-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.28](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.27...@standardnotes/domain-events-infra@1.7.28) (2022-07-26)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.27](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.26...@standardnotes/domain-events-infra@1.7.27) (2022-07-25)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.26](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.25...@standardnotes/domain-events-infra@1.7.26) (2022-07-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.25](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.24...@standardnotes/domain-events-infra@1.7.25) (2022-07-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.24](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.23...@standardnotes/domain-events-infra@1.7.24) (2022-07-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.23](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.22...@standardnotes/domain-events-infra@1.7.23) (2022-07-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.22](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.21...@standardnotes/domain-events-infra@1.7.22) (2022-07-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.21](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.20...@standardnotes/domain-events-infra@1.7.21) (2022-07-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.20](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.19...@standardnotes/domain-events-infra@1.7.20) (2022-07-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.19](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.18...@standardnotes/domain-events-infra@1.7.19) (2022-07-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.18](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.17...@standardnotes/domain-events-infra@1.7.18) (2022-07-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.17](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.16...@standardnotes/domain-events-infra@1.7.17) (2022-07-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.16](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.15...@standardnotes/domain-events-infra@1.7.16) (2022-07-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.15](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.14...@standardnotes/domain-events-infra@1.7.15) (2022-07-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.14](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.13...@standardnotes/domain-events-infra@1.7.14) (2022-07-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.13](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.12...@standardnotes/domain-events-infra@1.7.13) (2022-07-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.12](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.11...@standardnotes/domain-events-infra@1.7.12) (2022-07-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.11](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.10...@standardnotes/domain-events-infra@1.7.11) (2022-07-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.10](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.9...@standardnotes/domain-events-infra@1.7.10) (2022-07-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.9](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.8...@standardnotes/domain-events-infra@1.7.9) (2022-07-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.8](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.7...@standardnotes/domain-events-infra@1.7.8) (2022-07-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.7](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.6...@standardnotes/domain-events-infra@1.7.7) (2022-07-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.6](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.5...@standardnotes/domain-events-infra@1.7.6) (2022-07-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.5](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.4...@standardnotes/domain-events-infra@1.7.5) (2022-07-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.4](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.3...@standardnotes/domain-events-infra@1.7.4) (2022-07-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.2...@standardnotes/domain-events-infra@1.7.3) (2022-07-06)

### Bug Fixes

* files included in distributable packages ([97ba31f](https://github.com/standardnotes/server/commit/97ba31f345fc95df0c15a348f0461fb9e5bcb923))

## [1.7.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.1...@standardnotes/domain-events-infra@1.7.2) (2022-07-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.7.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-events-infra@1.7.0...@standardnotes/domain-events-infra@1.7.1) (2022-07-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

# 1.7.0 (2022-07-06)

### Features

* add domain-event-infra package ([808d18e](https://github.com/standardnotes/server/commit/808d18e7cd499afe9040e4306b1e3e351fb244bd))

## [1.5.8](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.5.7...@standardnotes/domain-events-infra@1.5.8) (2022-07-05)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.5.7](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.5.6...@standardnotes/domain-events-infra@1.5.7) (2022-07-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.5.6](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.5.5...@standardnotes/domain-events-infra@1.5.6) (2022-06-29)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.5.5](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.5.4...@standardnotes/domain-events-infra@1.5.5) (2022-06-27)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.5.4](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.5.3...@standardnotes/domain-events-infra@1.5.4) (2022-06-27)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.5.3](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.5.2...@standardnotes/domain-events-infra@1.5.3) (2022-06-27)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.5.2](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.5.1...@standardnotes/domain-events-infra@1.5.2) (2022-06-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.5.1](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.5.0...@standardnotes/domain-events-infra@1.5.1) (2022-06-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

# [1.5.0](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.135...@standardnotes/domain-events-infra@1.5.0) (2022-06-16)

### Features

* add origin and optional target meta properties to events ([43c4e81](https://github.com/standardnotes/snjs/commit/43c4e819c8a40cd2d04088bf93e9e3a3af1f1b8f))

## [1.4.135](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.134...@standardnotes/domain-events-infra@1.4.135) (2022-06-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.134](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.133...@standardnotes/domain-events-infra@1.4.134) (2022-06-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.133](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.132...@standardnotes/domain-events-infra@1.4.133) (2022-06-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.132](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.131...@standardnotes/domain-events-infra@1.4.132) (2022-06-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.131](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.130...@standardnotes/domain-events-infra@1.4.131) (2022-06-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.130](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.129...@standardnotes/domain-events-infra@1.4.130) (2022-06-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.129](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.128...@standardnotes/domain-events-infra@1.4.129) (2022-06-03)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.128](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.127...@standardnotes/domain-events-infra@1.4.128) (2022-06-02)

### Bug Fixes

* parsing create at date on events from JSON string ([a914657](https://github.com/standardnotes/snjs/commit/a914657f949c522ffa6263ab2b92ddd34256e94e))

## [1.4.127](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.126...@standardnotes/domain-events-infra@1.4.127) (2022-06-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.126](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.125...@standardnotes/domain-events-infra@1.4.126) (2022-05-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.125](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.124...@standardnotes/domain-events-infra@1.4.125) (2022-05-27)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.124](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.123...@standardnotes/domain-events-infra@1.4.124) (2022-05-26)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.123](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.122...@standardnotes/domain-events-infra@1.4.123) (2022-05-25)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.122](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.121...@standardnotes/domain-events-infra@1.4.122) (2022-05-24)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.121](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.120...@standardnotes/domain-events-infra@1.4.121) (2022-05-24)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.120](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.119...@standardnotes/domain-events-infra@1.4.120) (2022-05-22)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.119](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.118...@standardnotes/domain-events-infra@1.4.119) (2022-05-20)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.118](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.117...@standardnotes/domain-events-infra@1.4.118) (2022-05-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.117](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.116...@standardnotes/domain-events-infra@1.4.117) (2022-05-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.116](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.115...@standardnotes/domain-events-infra@1.4.116) (2022-05-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.115](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.114...@standardnotes/domain-events-infra@1.4.115) (2022-05-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.114](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.113...@standardnotes/domain-events-infra@1.4.114) (2022-05-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.113](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.112...@standardnotes/domain-events-infra@1.4.113) (2022-05-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.112](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.111...@standardnotes/domain-events-infra@1.4.112) (2022-05-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.111](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.110...@standardnotes/domain-events-infra@1.4.111) (2022-05-05)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.110](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.108...@standardnotes/domain-events-infra@1.4.110) (2022-05-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.109](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.108...@standardnotes/domain-events-infra@1.4.109) (2022-05-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.108](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.107...@standardnotes/domain-events-infra@1.4.108) (2022-05-03)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.107](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.106...@standardnotes/domain-events-infra@1.4.107) (2022-05-02)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.106](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.105...@standardnotes/domain-events-infra@1.4.106) (2022-04-27)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.105](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.104...@standardnotes/domain-events-infra@1.4.105) (2022-04-25)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.104](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.103...@standardnotes/domain-events-infra@1.4.104) (2022-04-22)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.103](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.102...@standardnotes/domain-events-infra@1.4.103) (2022-04-21)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.102](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.101...@standardnotes/domain-events-infra@1.4.102) (2022-04-20)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.101](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.100...@standardnotes/domain-events-infra@1.4.101) (2022-04-20)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.100](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.99...@standardnotes/domain-events-infra@1.4.100) (2022-04-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.99](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.98...@standardnotes/domain-events-infra@1.4.99) (2022-04-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.98](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.97...@standardnotes/domain-events-infra@1.4.98) (2022-04-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.97](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.96...@standardnotes/domain-events-infra@1.4.97) (2022-04-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.96](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.95...@standardnotes/domain-events-infra@1.4.96) (2022-04-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.95](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.94...@standardnotes/domain-events-infra@1.4.95) (2022-04-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.94](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.93...@standardnotes/domain-events-infra@1.4.94) (2022-04-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.93](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.92...@standardnotes/domain-events-infra@1.4.93) (2022-04-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.92](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.91...@standardnotes/domain-events-infra@1.4.92) (2022-04-12)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.91](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.90...@standardnotes/domain-events-infra@1.4.91) (2022-04-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.90](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.89...@standardnotes/domain-events-infra@1.4.90) (2022-04-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.89](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.88...@standardnotes/domain-events-infra@1.4.89) (2022-04-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.88](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.87...@standardnotes/domain-events-infra@1.4.88) (2022-03-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.87](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.86...@standardnotes/domain-events-infra@1.4.87) (2022-03-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.86](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.85...@standardnotes/domain-events-infra@1.4.86) (2022-03-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.85](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.84...@standardnotes/domain-events-infra@1.4.85) (2022-03-30)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.84](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.83...@standardnotes/domain-events-infra@1.4.84) (2022-03-29)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.83](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.82...@standardnotes/domain-events-infra@1.4.83) (2022-03-29)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.82](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.81...@standardnotes/domain-events-infra@1.4.82) (2022-03-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.81](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.80...@standardnotes/domain-events-infra@1.4.81) (2022-03-23)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.80](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.79...@standardnotes/domain-events-infra@1.4.80) (2022-03-23)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.79](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.78...@standardnotes/domain-events-infra@1.4.79) (2022-03-22)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.78](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.77...@standardnotes/domain-events-infra@1.4.78) (2022-03-21)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.77](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.76...@standardnotes/domain-events-infra@1.4.77) (2022-03-21)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.76](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.75...@standardnotes/domain-events-infra@1.4.76) (2022-03-18)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.75](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.74...@standardnotes/domain-events-infra@1.4.75) (2022-03-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.74](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.73...@standardnotes/domain-events-infra@1.4.74) (2022-03-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.73](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.71...@standardnotes/domain-events-infra@1.4.73) (2022-03-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.72](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.71...@standardnotes/domain-events-infra@1.4.72) (2022-03-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.71](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.70...@standardnotes/domain-events-infra@1.4.71) (2022-03-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.70](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.69...@standardnotes/domain-events-infra@1.4.70) (2022-03-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.69](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.68...@standardnotes/domain-events-infra@1.4.69) (2022-03-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.68](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.67...@standardnotes/domain-events-infra@1.4.68) (2022-03-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.67](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.66...@standardnotes/domain-events-infra@1.4.67) (2022-03-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.66](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.65...@standardnotes/domain-events-infra@1.4.66) (2022-03-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.65](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.64...@standardnotes/domain-events-infra@1.4.65) (2022-03-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.64](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.63...@standardnotes/domain-events-infra@1.4.64) (2022-03-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.63](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.62...@standardnotes/domain-events-infra@1.4.63) (2022-03-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.62](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.61...@standardnotes/domain-events-infra@1.4.62) (2022-03-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.61](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.60...@standardnotes/domain-events-infra@1.4.61) (2022-03-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.60](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.59...@standardnotes/domain-events-infra@1.4.60) (2022-03-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.59](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.58...@standardnotes/domain-events-infra@1.4.59) (2022-03-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.58](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.57...@standardnotes/domain-events-infra@1.4.58) (2022-03-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.57](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.56...@standardnotes/domain-events-infra@1.4.57) (2022-03-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.56](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.54...@standardnotes/domain-events-infra@1.4.56) (2022-02-28)

### Bug Fixes

* add pseudo change to get lerna to trigger ([41e6817](https://github.com/standardnotes/snjs/commit/41e6817bbf726b0932cdf16f58622328b9e42803))

## [1.4.55](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.54...@standardnotes/domain-events-infra@1.4.55) (2022-02-28)

### Bug Fixes

* add pseudo change to get lerna to trigger ([41e6817](https://github.com/standardnotes/snjs/commit/41e6817bbf726b0932cdf16f58622328b9e42803))

## [1.4.54](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.53...@standardnotes/domain-events-infra@1.4.54) (2022-02-27)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.53](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.52...@standardnotes/domain-events-infra@1.4.53) (2022-02-25)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.52](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.51...@standardnotes/domain-events-infra@1.4.52) (2022-02-24)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.51](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.50...@standardnotes/domain-events-infra@1.4.51) (2022-02-22)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.50](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.49...@standardnotes/domain-events-infra@1.4.50) (2022-02-22)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.49](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.48...@standardnotes/domain-events-infra@1.4.49) (2022-02-22)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.48](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.47...@standardnotes/domain-events-infra@1.4.48) (2022-02-18)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.47](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.46...@standardnotes/domain-events-infra@1.4.47) (2022-02-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.46](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.45...@standardnotes/domain-events-infra@1.4.46) (2022-02-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.45](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.44...@standardnotes/domain-events-infra@1.4.45) (2022-02-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.44](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.43...@standardnotes/domain-events-infra@1.4.44) (2022-02-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.43](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.42...@standardnotes/domain-events-infra@1.4.43) (2022-02-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.42](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.41...@standardnotes/domain-events-infra@1.4.42) (2022-02-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.41](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.40...@standardnotes/domain-events-infra@1.4.41) (2022-02-16)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.40](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.39...@standardnotes/domain-events-infra@1.4.40) (2022-02-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.39](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.38...@standardnotes/domain-events-infra@1.4.39) (2022-02-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.38](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.37...@standardnotes/domain-events-infra@1.4.38) (2022-02-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.37](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.36...@standardnotes/domain-events-infra@1.4.37) (2022-02-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.36](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.35...@standardnotes/domain-events-infra@1.4.36) (2022-02-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.35](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.34...@standardnotes/domain-events-infra@1.4.35) (2022-02-11)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.34](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.33...@standardnotes/domain-events-infra@1.4.34) (2022-02-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.33](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.32...@standardnotes/domain-events-infra@1.4.33) (2022-02-10)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.32](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.31...@standardnotes/domain-events-infra@1.4.32) (2022-02-09)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.31](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.30...@standardnotes/domain-events-infra@1.4.31) (2022-02-08)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.30](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.29...@standardnotes/domain-events-infra@1.4.30) (2022-02-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.29](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.28...@standardnotes/domain-events-infra@1.4.29) (2022-02-02)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.28](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.27...@standardnotes/domain-events-infra@1.4.28) (2022-02-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.27](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.26...@standardnotes/domain-events-infra@1.4.27) (2022-02-01)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.26](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.25...@standardnotes/domain-events-infra@1.4.26) (2022-01-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.25](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.24...@standardnotes/domain-events-infra@1.4.25) (2022-01-31)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.24](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.23...@standardnotes/domain-events-infra@1.4.24) (2022-01-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.23](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.22...@standardnotes/domain-events-infra@1.4.23) (2022-01-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.22](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.21...@standardnotes/domain-events-infra@1.4.22) (2022-01-27)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.21](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.20...@standardnotes/domain-events-infra@1.4.21) (2022-01-19)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.20](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.19...@standardnotes/domain-events-infra@1.4.20) (2022-01-18)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.19](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.18...@standardnotes/domain-events-infra@1.4.19) (2022-01-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.18](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.17...@standardnotes/domain-events-infra@1.4.18) (2022-01-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.17](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.16...@standardnotes/domain-events-infra@1.4.17) (2022-01-17)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.16](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.15...@standardnotes/domain-events-infra@1.4.16) (2022-01-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.15](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.14...@standardnotes/domain-events-infra@1.4.15) (2022-01-15)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.14](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.13...@standardnotes/domain-events-infra@1.4.14) (2022-01-14)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.13](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.12...@standardnotes/domain-events-infra@1.4.13) (2022-01-13)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.12](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.11...@standardnotes/domain-events-infra@1.4.12) (2022-01-07)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.11](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.10...@standardnotes/domain-events-infra@1.4.11) (2022-01-06)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.10](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.9...@standardnotes/domain-events-infra@1.4.10) (2022-01-04)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.9](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.8...@standardnotes/domain-events-infra@1.4.9) (2021-12-29)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.8](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.7...@standardnotes/domain-events-infra@1.4.8) (2021-12-29)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.7](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.6...@standardnotes/domain-events-infra@1.4.7) (2021-12-29)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.6](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.5...@standardnotes/domain-events-infra@1.4.6) (2021-12-29)

### Bug Fixes

* remove code coverage reports from repository ([61f5dfd](https://github.com/standardnotes/snjs/commit/61f5dfd8e9698e36142df131ad210749865f70f4))

## [1.4.5](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.4...@standardnotes/domain-events-infra@1.4.5) (2021-12-29)

### Bug Fixes

* correct gitignore paths ([cefc0cf](https://github.com/standardnotes/snjs/commit/cefc0cfcf98e3e5378e055b8c46931b53b23195e))
* include dist in static components ([d17ce0f](https://github.com/standardnotes/snjs/commit/d17ce0f67045c6e4c97bf4577709aa58794e72e6))

## [1.4.4](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.3...@standardnotes/domain-events-infra@1.4.4) (2021-12-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.3](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.2...@standardnotes/domain-events-infra@1.4.3) (2021-12-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.2](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.1...@standardnotes/domain-events-infra@1.4.2) (2021-12-28)

**Note:** Version bump only for package @standardnotes/domain-events-infra

## [1.4.1](https://github.com/standardnotes/snjs/compare/@standardnotes/domain-events-infra@1.4.0...@standardnotes/domain-events-infra@1.4.1) (2021-12-23)

**Note:** Version bump only for package @standardnotes/domain-events-infra

# 1.4.0 (2021-12-23)

### Features

* rename email backup setting to email backup frequency ([25e7b46](https://github.com/standardnotes/snjs/commit/25e7b4620834711ac7f513ae893898c5eab1af53))

## 1.3.3 (2021-12-23)

### Bug Fixes

* lock package versions ([8aa2ce6](https://github.com/standardnotes/snjs/commit/8aa2ce676b57598ab72840adf851869d8e769022))

## 1.3.2 (2021-12-23)

### Bug Fixes

* add publishing from package version by lerna ([80433d0](https://github.com/standardnotes/snjs/commit/80433d044f258095753482b8322d73aba3d9a9e4))

## 1.3.1 (2021-12-23)

### Bug Fixes

* remove the ammend commit from lerna versioning ([f0400d9](https://github.com/standardnotes/snjs/commit/f0400d9a2f5a04eaece2e4c16da71166a2ddb251))

# 1.3.0 (2021-12-23)

### Features

* add one drive backup frequency setting ([#522](https://github.com/standardnotes/snjs/issues/522)) ([c27827f](https://github.com/standardnotes/snjs/commit/c27827f8c7969dd32511c9c75122ece372132c83))

## 1.2.4 (2021-12-23)

### Bug Fixes

* remove running tests upon deployment - ensured on PR status checks ([#523](https://github.com/standardnotes/snjs/issues/523)) ([5c795d1](https://github.com/standardnotes/snjs/commit/5c795d17b583d02955773576384e622c3ef7f418))

## 1.2.3 (2021-12-23)

### Bug Fixes

* pr template ([#518](https://github.com/standardnotes/snjs/issues/518)) ([b445bb6](https://github.com/standardnotes/snjs/commit/b445bb64841217ae27c2514887629235be95d2a3))

## 1.2.2 (2021-12-23)

### Bug Fixes

* checkout with personal access token ([773c1ef](https://github.com/standardnotes/snjs/commit/773c1ef91c4452ad411e928342060dcb59428e3c))

## 1.2.1 (2021-12-22)

### Bug Fixes

* gpg signing with CI StandardNotes user ([d72f61c](https://github.com/standardnotes/snjs/commit/d72f61c23cd15b31d37340cc756d16526634b9ee))

# 1.2.0 (2021-12-22)

### Bug Fixes

* change user changed email event name ([#409](https://github.com/standardnotes/snjs/issues/409)) ([84efd16](https://github.com/standardnotes/snjs/commit/84efd161574d98a368201c7afcc1eff8ef916631))
* update domain-events-infra dependency ([f80ca34](https://github.com/standardnotes/snjs/commit/f80ca3460e3eeb9643d18ca970204f7561f70347))
* versioning and package dependencies ([#509](https://github.com/standardnotes/snjs/issues/509)) ([fe1df94](https://github.com/standardnotes/snjs/commit/fe1df94eff3e90bcf9ba0cf45bdc44ac49204c71))

### Features

* upgrade node engine versions to latest active LTS ([#462](https://github.com/standardnotes/snjs/issues/462)) ([686fc15](https://github.com/standardnotes/snjs/commit/686fc15030d302b474ebb7ef1cd4dcc48ec42359))
