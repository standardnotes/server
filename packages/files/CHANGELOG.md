# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.35.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.34.2...@standardnotes/files-server@1.35.0) (2023-11-16)

### Features

* add grpc sessions validation server ([#928](https://github.com/standardnotes/files/issues/928)) ([4f62cac](https://github.com/standardnotes/files/commit/4f62cac213a6b5f503040ef6319e5198967974ce))

## [1.34.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.34.1...@standardnotes/files-server@1.34.2) (2023-11-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.34.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.34.0...@standardnotes/files-server@1.34.1) (2023-11-13)

**Note:** Version bump only for package @standardnotes/files-server

# [1.34.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.33.0...@standardnotes/files-server@1.34.0) (2023-11-10)

### Features

* add keep-alive connections to subservices ([#924](https://github.com/standardnotes/files/issues/924)) ([daad76d](https://github.com/standardnotes/files/commit/daad76d0ddae34c59dce45eedc4a055c4a11456d))

# [1.33.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.32.5...@standardnotes/files-server@1.33.0) (2023-11-10)

### Features

* add graceful shutdown procedures upon SIGTERM ([#923](https://github.com/standardnotes/files/issues/923)) ([c24353c](https://github.com/standardnotes/files/commit/c24353cc24ebf4b40ff9a2cec8e37cfdef109e37))

## [1.32.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.32.4...@standardnotes/files-server@1.32.5) (2023-11-07)

### Bug Fixes

* account deletion event ([#904](https://github.com/standardnotes/files/issues/904)) ([d66ae62](https://github.com/standardnotes/files/commit/d66ae62cf4f413cac5f6f4eac45dc0f1ddbc9e32))

## [1.32.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.32.3...@standardnotes/files-server@1.32.4) (2023-11-07)

### Bug Fixes

* remove open telemetry from code ([#903](https://github.com/standardnotes/files/issues/903)) ([751f3b2](https://github.com/standardnotes/files/commit/751f3b25476c5be3d663ad8540c43266acd39493))

## [1.32.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.32.2...@standardnotes/files-server@1.32.3) (2023-10-31)

### Bug Fixes

* add fallback methods for 404 requests ([#893](https://github.com/standardnotes/files/issues/893)) ([16a6815](https://github.com/standardnotes/files/commit/16a6815b69e344573ae07682f3bac1d44d715d79))

## [1.32.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.32.1...@standardnotes/files-server@1.32.2) (2023-10-26)

**Note:** Version bump only for package @standardnotes/files-server

## [1.32.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.32.0...@standardnotes/files-server@1.32.1) (2023-10-26)

**Note:** Version bump only for package @standardnotes/files-server

# [1.32.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.31.1...@standardnotes/files-server@1.32.0) (2023-10-19)

### Features

* remove transition state ([#882](https://github.com/standardnotes/files/issues/882)) ([a2c1ebe](https://github.com/standardnotes/files/commit/a2c1ebe675cd5678c923715056a6966f465a15d6))

## [1.31.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.31.0...@standardnotes/files-server@1.31.1) (2023-10-18)

**Note:** Version bump only for package @standardnotes/files-server

# [1.31.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.30.7...@standardnotes/files-server@1.31.0) (2023-10-17)

### Features

* add wrapping sqs receive message with open telemetry ([aba4f90](https://github.com/standardnotes/files/commit/aba4f90485e1b40baac34561321a5381945aa27e))

## [1.30.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.30.6...@standardnotes/files-server@1.30.7) (2023-10-13)

### Bug Fixes

* reduce the amount of metrics gathered in telemetery ([32fe8d0](https://github.com/standardnotes/files/commit/32fe8d0a8523d6e1875cd0814c0cbdf27d8df7b3))

## [1.30.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.30.5...@standardnotes/files-server@1.30.6) (2023-10-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.30.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.30.4...@standardnotes/files-server@1.30.5) (2023-10-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.30.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.30.3...@standardnotes/files-server@1.30.4) (2023-10-12)

### Bug Fixes

* disable opentelemetry tracing on async worker jobs ([e0b19ef](https://github.com/standardnotes/files/commit/e0b19ef011197c854cb6e833dbaa982f661e8d17))
* disable sqs open telemetry manual tracing in favour of automated instrumentation ([337eae7](https://github.com/standardnotes/files/commit/337eae73c6cb18ae872527b06f6c23e1c48b6dff))

## [1.30.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.30.2...@standardnotes/files-server@1.30.3) (2023-10-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.30.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.30.1...@standardnotes/files-server@1.30.2) (2023-10-11)

**Note:** Version bump only for package @standardnotes/files-server

## [1.30.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.30.0...@standardnotes/files-server@1.30.1) (2023-10-11)

**Note:** Version bump only for package @standardnotes/files-server

# [1.30.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.29.4...@standardnotes/files-server@1.30.0) (2023-10-11)

### Features

* add opentelemetry tracing in distributed system ([72c9b28](https://github.com/standardnotes/files/commit/72c9b28ebe108a2011d1a598fd4682132a533126))

## [1.29.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.29.3...@standardnotes/files-server@1.29.4) (2023-10-11)

**Note:** Version bump only for package @standardnotes/files-server

## [1.29.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.29.2...@standardnotes/files-server@1.29.3) (2023-10-11)

**Note:** Version bump only for package @standardnotes/files-server

## [1.29.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.29.1...@standardnotes/files-server@1.29.2) (2023-10-11)

**Note:** Version bump only for package @standardnotes/files-server

## [1.29.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.29.0...@standardnotes/files-server@1.29.1) (2023-10-11)

**Note:** Version bump only for package @standardnotes/files-server

# [1.29.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.28.5...@standardnotes/files-server@1.29.0) (2023-10-10)

### Features

* remove newrelic integration ([#862](https://github.com/standardnotes/files/issues/862)) ([efb341e](https://github.com/standardnotes/files/commit/efb341eb991d37efab7c1efce035ee07ad0a101e))

## [1.28.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.28.4...@standardnotes/files-server@1.28.5) (2023-10-10)

### Bug Fixes

* opentelemetry instantiation ([08f7c54](https://github.com/standardnotes/files/commit/08f7c5447b020fee71a1e49d382db32082bb9044))

## [1.28.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.28.3...@standardnotes/files-server@1.28.4) (2023-10-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.28.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.28.2...@standardnotes/files-server@1.28.3) (2023-10-09)

### Reverts

* Revert "Revert "fix: setting parent span on workers"" ([76ae6f5](https://github.com/standardnotes/files/commit/76ae6f5a882a82ab5f635452e3bc7b2b16709531))

## [1.28.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.28.1...@standardnotes/files-server@1.28.2) (2023-10-09)

### Reverts

* Revert "fix: setting parent span on workers" ([3fc07a5](https://github.com/standardnotes/files/commit/3fc07a5b60c26b583efd88e8a80d4c4321e71efb))

## [1.28.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.28.0...@standardnotes/files-server@1.28.1) (2023-10-09)

### Bug Fixes

* setting parent span on workers ([1c54d18](https://github.com/standardnotes/files/commit/1c54d18c3ca75353701ba921492a5ecfaa2e3572))

# [1.28.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.27.0...@standardnotes/files-server@1.28.0) (2023-10-09)

### Features

* add custom tracing on workers ([65ced2c](https://github.com/standardnotes/files/commit/65ced2cc7b0686dc8af5cdad499412fc8fd29d1d))

# [1.27.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.26.4...@standardnotes/files-server@1.27.0) (2023-10-09)

### Features

* add opentelemetry to all services ([5e930d0](https://github.com/standardnotes/files/commit/5e930d08eb60a0da800081342315e7edaf130951))

## [1.26.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.26.3...@standardnotes/files-server@1.26.4) (2023-10-09)

### Bug Fixes

* remove xray sdk in favor of opentelemetry ([b736dab](https://github.com/standardnotes/files/commit/b736dab3c1f76c9e03c4bc7bbf153dcb3309b7cb))

## [1.26.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.26.2...@standardnotes/files-server@1.26.3) (2023-10-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.26.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.26.1...@standardnotes/files-server@1.26.2) (2023-10-05)

**Note:** Version bump only for package @standardnotes/files-server

## [1.26.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.26.0...@standardnotes/files-server@1.26.1) (2023-10-05)

**Note:** Version bump only for package @standardnotes/files-server

# [1.26.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.25.6...@standardnotes/files-server@1.26.0) (2023-10-04)

### Features

* add xray to syncing server and files ([6583ff6](https://github.com/standardnotes/files/commit/6583ff6cd90f7881c1a79c0f904f1b1db96fc5b3))

## [1.25.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.25.5...@standardnotes/files-server@1.25.6) (2023-10-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.25.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.25.4...@standardnotes/files-server@1.25.5) (2023-10-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.25.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.25.3...@standardnotes/files-server@1.25.4) (2023-10-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.25.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.25.2...@standardnotes/files-server@1.25.3) (2023-10-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.25.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.25.1...@standardnotes/files-server@1.25.2) (2023-10-03)

**Note:** Version bump only for package @standardnotes/files-server

## [1.25.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.25.0...@standardnotes/files-server@1.25.1) (2023-10-03)

**Note:** Version bump only for package @standardnotes/files-server

# [1.25.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.24.1...@standardnotes/files-server@1.25.0) (2023-09-28)

### Features

* block file operations during transition ([#856](https://github.com/standardnotes/files/issues/856)) ([676cf36](https://github.com/standardnotes/files/commit/676cf36f8d769aa433880b2800f0457d06fbbf14))

## [1.24.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.24.0...@standardnotes/files-server@1.24.1) (2023-09-27)

**Note:** Version bump only for package @standardnotes/files-server

# [1.24.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.23.2...@standardnotes/files-server@1.24.0) (2023-09-26)

### Features

* refactor handling revision creation from dump ([#854](https://github.com/standardnotes/files/issues/854)) ([ca6dbc0](https://github.com/standardnotes/files/commit/ca6dbc00537bb20f508f9310b1a838421f53a643))

## [1.23.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.23.1...@standardnotes/files-server@1.23.2) (2023-09-25)

**Note:** Version bump only for package @standardnotes/files-server

## [1.23.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.23.0...@standardnotes/files-server@1.23.1) (2023-09-25)

**Note:** Version bump only for package @standardnotes/files-server

# [1.23.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.28...@standardnotes/files-server@1.23.0) (2023-09-25)

### Features

* remove shared vault files upon shared vault removal ([#852](https://github.com/standardnotes/files/issues/852)) ([7b1eec2](https://github.com/standardnotes/files/commit/7b1eec21e54330bebbeebb80cec3ba4284112aab))

## [1.22.28](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.27...@standardnotes/files-server@1.22.28) (2023-09-25)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.27](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.26...@standardnotes/files-server@1.22.27) (2023-09-21)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.26](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.25...@standardnotes/files-server@1.22.26) (2023-09-20)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.25](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.24...@standardnotes/files-server@1.22.25) (2023-09-20)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.24](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.23...@standardnotes/files-server@1.22.24) (2023-09-19)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.23](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.22...@standardnotes/files-server@1.22.23) (2023-09-18)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.22](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.21...@standardnotes/files-server@1.22.22) (2023-09-18)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.21](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.20...@standardnotes/files-server@1.22.21) (2023-09-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.20](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.19...@standardnotes/files-server@1.22.20) (2023-09-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.19](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.18...@standardnotes/files-server@1.22.19) (2023-09-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.18](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.17...@standardnotes/files-server@1.22.18) (2023-09-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.17](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.16...@standardnotes/files-server@1.22.17) (2023-09-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.16](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.15...@standardnotes/files-server@1.22.16) (2023-09-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.15](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.14...@standardnotes/files-server@1.22.15) (2023-09-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.14](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.13...@standardnotes/files-server@1.22.14) (2023-09-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.13](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.12...@standardnotes/files-server@1.22.13) (2023-09-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.12](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.11...@standardnotes/files-server@1.22.12) (2023-09-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.11](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.10...@standardnotes/files-server@1.22.11) (2023-09-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.10](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.9...@standardnotes/files-server@1.22.10) (2023-09-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.9](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.8...@standardnotes/files-server@1.22.9) (2023-09-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.8](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.7...@standardnotes/files-server@1.22.8) (2023-09-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.6...@standardnotes/files-server@1.22.7) (2023-09-01)

### Bug Fixes

* remove the alive and kicking info logs on workers ([1bef127](https://github.com/standardnotes/files/commit/1bef1279e6dbf3cbdfa87e44aa9108ed6dbb3b0f))

## [1.22.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.5...@standardnotes/files-server@1.22.6) (2023-08-31)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.4...@standardnotes/files-server@1.22.5) (2023-08-31)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.3...@standardnotes/files-server@1.22.4) (2023-08-30)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.2...@standardnotes/files-server@1.22.3) (2023-08-30)

**Note:** Version bump only for package @standardnotes/files-server

## [1.22.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.1...@standardnotes/files-server@1.22.2) (2023-08-28)

### Bug Fixes

* allow self hosted to use new model of items ([#714](https://github.com/standardnotes/files/issues/714)) ([aef9254](https://github.com/standardnotes/files/commit/aef9254713560c00a90a3e84e3cd94417e8f30d2))

## [1.22.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.22.0...@standardnotes/files-server@1.22.1) (2023-08-24)

**Note:** Version bump only for package @standardnotes/files-server

# [1.22.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.21.0...@standardnotes/files-server@1.22.0) (2023-08-23)

### Features

* add handling file moving and updating storage quota ([#705](https://github.com/standardnotes/files/issues/705)) ([205a1ed](https://github.com/standardnotes/files/commit/205a1ed637b626be13fc656276508f3c7791024f))

# [1.21.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.20.4...@standardnotes/files-server@1.21.0) (2023-08-22)

### Features

* consider shared vault owner quota when uploading files to shared vault ([#704](https://github.com/standardnotes/files/issues/704)) ([34085ac](https://github.com/standardnotes/files/commit/34085ac6fb7e61d471bd3b4ae8e72112df25c3ee))

## [1.20.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.20.3...@standardnotes/files-server@1.20.4) (2023-08-18)

**Note:** Version bump only for package @standardnotes/files-server

## [1.20.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.20.2...@standardnotes/files-server@1.20.3) (2023-08-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.20.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.20.1...@standardnotes/files-server@1.20.2) (2023-08-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.20.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.20.0...@standardnotes/files-server@1.20.1) (2023-08-09)

**Note:** Version bump only for package @standardnotes/files-server

# [1.20.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.18...@standardnotes/files-server@1.20.0) (2023-08-08)

### Features

* update storage quota used for user based on shared vault files ([#689](https://github.com/standardnotes/files/issues/689)) ([5311e74](https://github.com/standardnotes/files/commit/5311e7426617da6fc75593dd0fcbff589ca4fc22))

## [1.19.18](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.17...@standardnotes/files-server@1.19.18) (2023-08-03)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.17](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.16...@standardnotes/files-server@1.19.17) (2023-08-02)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.16](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.15...@standardnotes/files-server@1.19.16) (2023-08-01)

### Bug Fixes

* controller naming ([#678](https://github.com/standardnotes/files/issues/678)) ([56f0aef](https://github.com/standardnotes/files/commit/56f0aef21d3fcec7ac7e968cb1c1b071becbbe26))

## [1.19.15](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.14...@standardnotes/files-server@1.19.15) (2023-07-27)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.14](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.13...@standardnotes/files-server@1.19.14) (2023-07-26)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.13](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.12...@standardnotes/files-server@1.19.13) (2023-07-26)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.12](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.11...@standardnotes/files-server@1.19.12) (2023-07-21)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.11](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.10...@standardnotes/files-server@1.19.11) (2023-07-21)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.10](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.9...@standardnotes/files-server@1.19.10) (2023-07-19)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.9](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.8...@standardnotes/files-server@1.19.9) (2023-07-17)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.8](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.7...@standardnotes/files-server@1.19.8) (2023-07-13)

### Bug Fixes

* **files:** handling unlimited storage quota on home server ([9be3517](https://github.com/standardnotes/files/commit/9be3517093f8dd7bbdd7507c1e2ff059e6c9a889))

## [1.19.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.6...@standardnotes/files-server@1.19.7) (2023-07-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.5...@standardnotes/files-server@1.19.6) (2023-07-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.4...@standardnotes/files-server@1.19.5) (2023-07-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.3...@standardnotes/files-server@1.19.4) (2023-07-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.2...@standardnotes/files-server@1.19.3) (2023-07-05)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.1...@standardnotes/files-server@1.19.2) (2023-06-30)

**Note:** Version bump only for package @standardnotes/files-server

## [1.19.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.19.0...@standardnotes/files-server@1.19.1) (2023-06-30)

**Note:** Version bump only for package @standardnotes/files-server

# [1.19.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.18.3...@standardnotes/files-server@1.19.0) (2023-06-30)

### Features

* shared vaults functionality in api-gateway,auth,files,common,security,domain-events. ([#629](https://github.com/standardnotes/files/issues/629)) ([fa7fbe2](https://github.com/standardnotes/files/commit/fa7fbe26e7b0707fc21d71e04af76870f5248baf))

## [1.18.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.18.2...@standardnotes/files-server@1.18.3) (2023-06-22)

### Bug Fixes

* **home-server:** add debug logs about container initalizations ([0df4715](https://github.com/standardnotes/files/commit/0df471585fd5b4626ec2972f3b9a3e33b2830e65))

## [1.18.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.18.1...@standardnotes/files-server@1.18.2) (2023-06-12)

### Bug Fixes

* **home-server:** accept application/octet-stream requests for files ([#625](https://github.com/standardnotes/files/issues/625)) ([c8974b7](https://github.com/standardnotes/files/commit/c8974b7fa229ff4f1e026e1ebff50d1081cc5f8b))

## [1.18.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.18.0...@standardnotes/files-server@1.18.1) (2023-06-09)

### Bug Fixes

* **files:** add debug logs for checking chunks upon finishing upload session ([5f0929c](https://github.com/standardnotes/files/commit/5f0929c1aa7b83661fb102bad34644db69ddf7eb))

# [1.18.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.17.1...@standardnotes/files-server@1.18.0) (2023-06-05)

### Features

* **home-server:** allow running the home server with a mysql and redis configuration ([#622](https://github.com/standardnotes/files/issues/622)) ([d6e531d](https://github.com/standardnotes/files/commit/d6e531d4b6c1c80a894f6d7ec93632595268dd64))

## [1.17.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.17.0...@standardnotes/files-server@1.17.1) (2023-06-02)

### Bug Fixes

* **home-server:** streaming logs ([a8b806a](https://github.com/standardnotes/files/commit/a8b806af084b3e3fe8707ff0cb041a74042ee049))

# [1.17.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.16.5...@standardnotes/files-server@1.17.0) (2023-06-02)

### Features

* **home-server:** add overriding environment variables in underlying services ([#621](https://github.com/standardnotes/files/issues/621)) ([f0cbec0](https://github.com/standardnotes/files/commit/f0cbec07b87d60dfad92072944553f76e0bea164))

## [1.16.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.16.4...@standardnotes/files-server@1.16.5) (2023-06-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.16.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.16.3...@standardnotes/files-server@1.16.4) (2023-06-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.16.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.16.2...@standardnotes/files-server@1.16.3) (2023-06-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.16.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.16.1...@standardnotes/files-server@1.16.2) (2023-06-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.16.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.16.0...@standardnotes/files-server@1.16.1) (2023-05-31)

**Note:** Version bump only for package @standardnotes/files-server

# [1.16.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.15.4...@standardnotes/files-server@1.16.0) (2023-05-31)

### Features

* **home-server:** add custom home server logs ([#619](https://github.com/standardnotes/files/issues/619)) ([bc63d0a](https://github.com/standardnotes/files/commit/bc63d0aeea86abbb4a144b2682b7070d7bdfe878))

## [1.15.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.15.3...@standardnotes/files-server@1.15.4) (2023-05-31)

### Reverts

* Revert "Revert "feat: make home server components publishable (#617)"" ([13c85d4](https://github.com/standardnotes/files/commit/13c85d43318caa0fb53726f13ea581ba4a5f816b)), closes [#617](https://github.com/standardnotes/files/issues/617)

## [1.15.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.15.2...@standardnotes/files-server@1.15.3) (2023-05-30)

### Reverts

* Revert "feat: make home server components publishable (#617)" ([1a8daef](https://github.com/standardnotes/files/commit/1a8daef79d55a8cdee1632b294b897176af64b26)), closes [#617](https://github.com/standardnotes/files/issues/617)

## [1.15.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.15.0...@standardnotes/files-server@1.15.2) (2023-05-30)

### Bug Fixes

* bump version manually to publish packages ([b0d01df](https://github.com/standardnotes/files/commit/b0d01dffd91557c67eac2940d9270bca208c1128))

# [1.15.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.14.0...@standardnotes/files-server@1.15.0) (2023-05-30)

### Features

* make home server components publishable ([#617](https://github.com/standardnotes/files/issues/617)) ([55fd873](https://github.com/standardnotes/files/commit/55fd873b375e204dc9b0477b2cc6ed4582e5b603))

# [1.14.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.13.0...@standardnotes/files-server@1.14.0) (2023-05-30)

### Features

* upgrade to node 20.2.0 ([#616](https://github.com/standardnotes/files/issues/616)) ([a6b062f](https://github.com/standardnotes/files/commit/a6b062f638595537e1ece28bc79bded41d875e18))

# [1.13.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.12.5...@standardnotes/files-server@1.13.0) (2023-05-29)

### Features

* add files server as a service to home-server ([#614](https://github.com/standardnotes/files/issues/614)) ([c7d575a](https://github.com/standardnotes/files/commit/c7d575a0ffc7eb3e8799c3835da5727584f4f67b))

## [1.12.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.12.4...@standardnotes/files-server@1.12.5) (2023-05-18)

**Note:** Version bump only for package @standardnotes/files-server

## [1.12.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.12.3...@standardnotes/files-server@1.12.4) (2023-05-17)

**Note:** Version bump only for package @standardnotes/files-server

## [1.12.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.12.2...@standardnotes/files-server@1.12.3) (2023-05-16)

**Note:** Version bump only for package @standardnotes/files-server

## [1.12.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.12.1...@standardnotes/files-server@1.12.2) (2023-05-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.12.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.12.0...@standardnotes/files-server@1.12.1) (2023-05-09)

### Bug Fixes

* node engine version requirement in package.json files ([62a0e89](https://github.com/standardnotes/files/commit/62a0e89748ab306566c4aa10b9dc0385fb0f1684))

# [1.12.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.11.2...@standardnotes/files-server@1.12.0) (2023-05-08)

### Features

* upgrade to node 20.1.0 ([#590](https://github.com/standardnotes/files/issues/590)) ([8fbb94d](https://github.com/standardnotes/files/commit/8fbb94d15ab664cca775ec71d51db465547c35ee))

## [1.11.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.11.1...@standardnotes/files-server@1.11.2) (2023-05-05)

### Bug Fixes

* remove @standardnotes/config from files ([542b296](https://github.com/standardnotes/files/commit/542b2960188fc3a02b07fa8d5f76852ad9b71b7d))
* remove sentry ([c6122d3](https://github.com/standardnotes/files/commit/c6122d33b9ef493758eb2f40837ae0ab90554a67))
* remove unused imports ([990140c](https://github.com/standardnotes/files/commit/990140c3924456ba05d85ef535c953081b217e4b))

## [1.11.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.11.0...@standardnotes/files-server@1.11.1) (2023-05-04)

### Bug Fixes

* add env vars to control cache type for home server ([c8ea2ab](https://github.com/standardnotes/files/commit/c8ea2ab199bfd6d1836078fa26d578400a8099db))

# [1.11.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.14...@standardnotes/files-server@1.11.0) (2023-05-02)

### Features

* **files:** add in memory upload repository for home server purposes ([#583](https://github.com/standardnotes/files/issues/583)) ([14ce6dd](https://github.com/standardnotes/files/commit/14ce6dd818f377d63156ad10353de7d193d443c3))

## [1.10.14](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.13...@standardnotes/files-server@1.10.14) (2023-05-02)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.13](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.12...@standardnotes/files-server@1.10.13) (2023-04-27)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.12](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.11...@standardnotes/files-server@1.10.12) (2023-04-27)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.11](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.10...@standardnotes/files-server@1.10.11) (2023-04-21)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.10](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.9...@standardnotes/files-server@1.10.10) (2023-04-21)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.9](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.8...@standardnotes/files-server@1.10.9) (2023-03-30)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.8](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.7...@standardnotes/files-server@1.10.8) (2023-03-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.6...@standardnotes/files-server@1.10.7) (2023-03-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.5...@standardnotes/files-server@1.10.6) (2023-03-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.4...@standardnotes/files-server@1.10.5) (2023-02-23)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.3...@standardnotes/files-server@1.10.4) (2023-02-23)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.2...@standardnotes/files-server@1.10.3) (2023-02-21)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.1...@standardnotes/files-server@1.10.2) (2023-02-20)

**Note:** Version bump only for package @standardnotes/files-server

## [1.10.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.10.0...@standardnotes/files-server@1.10.1) (2023-02-15)

**Note:** Version bump only for package @standardnotes/files-server

# [1.10.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.18...@standardnotes/files-server@1.10.0) (2023-02-15)

### Features

* optimize memory usage ([#444](https://github.com/standardnotes/files/issues/444)) ([fdf4b29](https://github.com/standardnotes/files/commit/fdf4b29ae2717e9b5d1fba2722beb7621a7e5c37))

## [1.9.18](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.17...@standardnotes/files-server@1.9.18) (2023-02-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.17](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.16...@standardnotes/files-server@1.9.17) (2023-02-09)

### Bug Fixes

* performance of startup sequence in supervisor controlled self-hosting setup ([5bbdc7e](https://github.com/standardnotes/files/commit/5bbdc7e426c436b17dc130e3c6d9163080561c76))

## [1.9.16](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.15...@standardnotes/files-server@1.9.16) (2023-02-09)

### Bug Fixes

* optimize memory usage ([e96fd6d](https://github.com/standardnotes/files/commit/e96fd6d69e1252842b5c91b1bedefa36e5d4a232))

## [1.9.15](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.14...@standardnotes/files-server@1.9.15) (2023-02-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.14](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.13...@standardnotes/files-server@1.9.14) (2023-01-30)

### Bug Fixes

* sqs configuration for aws sdk v3 ([b54c331](https://github.com/standardnotes/files/commit/b54c331bef0d4ad1ba1111700dc9f1bf64c1ea51))

## [1.9.13](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.12...@standardnotes/files-server@1.9.13) (2023-01-25)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.12](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.11...@standardnotes/files-server@1.9.12) (2023-01-20)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.11](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.10...@standardnotes/files-server@1.9.11) (2023-01-20)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.10](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.9...@standardnotes/files-server@1.9.10) (2023-01-19)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.9](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.8...@standardnotes/files-server@1.9.9) (2023-01-19)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.8](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.7...@standardnotes/files-server@1.9.8) (2023-01-19)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.6...@standardnotes/files-server@1.9.7) (2023-01-19)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.5...@standardnotes/files-server@1.9.6) (2023-01-18)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.4...@standardnotes/files-server@1.9.5) (2023-01-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.3...@standardnotes/files-server@1.9.4) (2023-01-13)

### Bug Fixes

* add robots.txt setup for api-gateway and files server to disallow indexing ([bb82043](https://github.com/standardnotes/files/commit/bb820437af2b9644d7597de045b5840037b81db3))

## [1.9.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.2...@standardnotes/files-server@1.9.3) (2022-12-28)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.1...@standardnotes/files-server@1.9.2) (2022-12-20)

**Note:** Version bump only for package @standardnotes/files-server

## [1.9.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.9.0...@standardnotes/files-server@1.9.1) (2022-12-19)

**Note:** Version bump only for package @standardnotes/files-server

# [1.9.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.52...@standardnotes/files-server@1.9.0) (2022-12-19)

### Features

* **auth:** add session traces ([8bcb552](https://github.com/standardnotes/files/commit/8bcb552783b2d12f3296b3195752168482790bc8))

## [1.8.52](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.51...@standardnotes/files-server@1.8.52) (2022-12-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.51](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.50...@standardnotes/files-server@1.8.51) (2022-12-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.50](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.49...@standardnotes/files-server@1.8.50) (2022-12-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.49](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.48...@standardnotes/files-server@1.8.49) (2022-12-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.48](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.47...@standardnotes/files-server@1.8.48) (2022-12-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.47](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.46...@standardnotes/files-server@1.8.47) (2022-12-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.46](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.45...@standardnotes/files-server@1.8.46) (2022-12-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.45](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.44...@standardnotes/files-server@1.8.45) (2022-12-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.44](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.43...@standardnotes/files-server@1.8.44) (2022-12-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.43](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.42...@standardnotes/files-server@1.8.43) (2022-12-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.42](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.41...@standardnotes/files-server@1.8.42) (2022-12-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.41](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.40...@standardnotes/files-server@1.8.41) (2022-12-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.40](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.39...@standardnotes/files-server@1.8.40) (2022-12-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.39](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.38...@standardnotes/files-server@1.8.39) (2022-12-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.38](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.37...@standardnotes/files-server@1.8.38) (2022-12-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.37](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.36...@standardnotes/files-server@1.8.37) (2022-12-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.36](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.35...@standardnotes/files-server@1.8.36) (2022-12-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.35](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.34...@standardnotes/files-server@1.8.35) (2022-12-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.34](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.33...@standardnotes/files-server@1.8.34) (2022-12-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.33](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.32...@standardnotes/files-server@1.8.33) (2022-12-05)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.32](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.31...@standardnotes/files-server@1.8.32) (2022-11-30)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.31](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.30...@standardnotes/files-server@1.8.31) (2022-11-28)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.30](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.29...@standardnotes/files-server@1.8.30) (2022-11-25)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.29](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.28...@standardnotes/files-server@1.8.29) (2022-11-24)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.28](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.27...@standardnotes/files-server@1.8.28) (2022-11-23)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.27](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.26...@standardnotes/files-server@1.8.27) (2022-11-23)

### Bug Fixes

* binding of sns and sqs with additional config ([74bc791](https://github.com/standardnotes/files/commit/74bc79116bc50d9a5af1a558db1b7108dcda6d0e))

## [1.8.26](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.25...@standardnotes/files-server@1.8.26) (2022-11-22)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.25](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.24...@standardnotes/files-server@1.8.25) (2022-11-21)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.24](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.23...@standardnotes/files-server@1.8.24) (2022-11-18)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.23](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.22...@standardnotes/files-server@1.8.23) (2022-11-16)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.22](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.21...@standardnotes/files-server@1.8.22) (2022-11-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.21](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.18...@standardnotes/files-server@1.8.21) (2022-11-14)

### Bug Fixes

* versioning issue ([7ca377f](https://github.com/standardnotes/files/commit/7ca377f1b889379e6a43a66c0134bf266763516d))

## [1.8.18](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.17...@standardnotes/files-server@1.8.18) (2022-11-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.17](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.16...@standardnotes/files-server@1.8.17) (2022-11-11)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.16](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.15...@standardnotes/files-server@1.8.16) (2022-11-11)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.15](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.14...@standardnotes/files-server@1.8.15) (2022-11-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.14](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.13...@standardnotes/files-server@1.8.14) (2022-11-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.13](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.12...@standardnotes/files-server@1.8.13) (2022-11-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.12](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.11...@standardnotes/files-server@1.8.12) (2022-11-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.11](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.10...@standardnotes/files-server@1.8.11) (2022-11-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.10](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.9...@standardnotes/files-server@1.8.10) (2022-11-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.9](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.8...@standardnotes/files-server@1.8.9) (2022-11-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.8](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.7...@standardnotes/files-server@1.8.8) (2022-11-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.6...@standardnotes/files-server@1.8.7) (2022-11-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.5...@standardnotes/files-server@1.8.6) (2022-11-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.4...@standardnotes/files-server@1.8.5) (2022-11-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.3...@standardnotes/files-server@1.8.4) (2022-11-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.2...@standardnotes/files-server@1.8.3) (2022-11-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.1...@standardnotes/files-server@1.8.2) (2022-11-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.8.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.8.0...@standardnotes/files-server@1.8.1) (2022-11-03)

**Note:** Version bump only for package @standardnotes/files-server

# [1.8.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.7.5...@standardnotes/files-server@1.8.0) (2022-11-02)

### Features

* **auth:** add processing user requests ([2255f85](https://github.com/standardnotes/files/commit/2255f856f928e855ac94f8aca4e1fb81047f58f7))

## [1.7.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.7.4...@standardnotes/files-server@1.7.5) (2022-11-02)

**Note:** Version bump only for package @standardnotes/files-server

## [1.7.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.7.3...@standardnotes/files-server@1.7.4) (2022-11-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.7.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.7.2...@standardnotes/files-server@1.7.3) (2022-10-31)

**Note:** Version bump only for package @standardnotes/files-server

## [1.7.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.7.1...@standardnotes/files-server@1.7.2) (2022-10-31)

**Note:** Version bump only for package @standardnotes/files-server

## [1.7.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.7.0...@standardnotes/files-server@1.7.1) (2022-10-26)

**Note:** Version bump only for package @standardnotes/files-server

# [1.7.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.18...@standardnotes/files-server@1.7.0) (2022-10-19)

### Features

* building server applications in ARM64 architecture for Docker ([fd92866](https://github.com/standardnotes/files/commit/fd92866ba1a86b22769b23cc4c8387a83f87979a))

## [1.6.18](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.17...@standardnotes/files-server@1.6.18) (2022-10-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.17](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.16...@standardnotes/files-server@1.6.17) (2022-10-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.16](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.15...@standardnotes/files-server@1.6.16) (2022-10-11)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.15](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.14...@standardnotes/files-server@1.6.15) (2022-10-11)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.14](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.13...@standardnotes/files-server@1.6.14) (2022-10-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.13](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.12...@standardnotes/files-server@1.6.13) (2022-10-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.12](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.11...@standardnotes/files-server@1.6.12) (2022-10-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.11](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.10...@standardnotes/files-server@1.6.11) (2022-10-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.10](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.9...@standardnotes/files-server@1.6.10) (2022-10-07)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.9](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.8...@standardnotes/files-server@1.6.9) (2022-10-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.8](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.7...@standardnotes/files-server@1.6.8) (2022-10-05)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.6...@standardnotes/files-server@1.6.7) (2022-10-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.5...@standardnotes/files-server@1.6.6) (2022-10-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.4...@standardnotes/files-server@1.6.5) (2022-10-03)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.3...@standardnotes/files-server@1.6.4) (2022-09-28)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.2...@standardnotes/files-server@1.6.3) (2022-09-21)

**Note:** Version bump only for package @standardnotes/files-server

## [1.6.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.1...@standardnotes/files-server@1.6.2) (2022-09-19)

### Bug Fixes

* add upper bound for FS file chunk upload ([dfa7e06](https://github.com/standardnotes/files/commit/dfa7e06f8780bec21893ec77ab4a0945a6681545))

## [1.6.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.6.0...@standardnotes/files-server@1.6.1) (2022-09-19)

### Bug Fixes

* **files:** uuid validator binding ([a628bdc](https://github.com/standardnotes/files/commit/a628bdc44e97935b8a79460b74c30c0d29ef83bf))

# [1.6.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.52...@standardnotes/files-server@1.6.0) (2022-09-19)

### Features

* **files:** add validating remote identifiers ([db15457](https://github.com/standardnotes/files/commit/db15457ce4eb533ec822cf93c3ed83eafe9e64d5))

## [1.5.52](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.51...@standardnotes/files-server@1.5.52) (2022-09-16)

### Bug Fixes

* **files:** add verifying permitted operation on valet token ([377d32c](https://github.com/standardnotes/files/commit/377d32c4498305f0f59ff59e7357f0d2f10ce3a2))

## [1.5.51](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.50...@standardnotes/files-server@1.5.51) (2022-09-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.50](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.49...@standardnotes/files-server@1.5.50) (2022-09-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.49](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.48...@standardnotes/files-server@1.5.49) (2022-09-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.48](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.47...@standardnotes/files-server@1.5.48) (2022-09-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.47](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.46...@standardnotes/files-server@1.5.47) (2022-09-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.46](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.45...@standardnotes/files-server@1.5.46) (2022-09-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.45](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.44...@standardnotes/files-server@1.5.45) (2022-09-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.44](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.43...@standardnotes/files-server@1.5.44) (2022-09-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.43](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.42...@standardnotes/files-server@1.5.43) (2022-09-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.42](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.41...@standardnotes/files-server@1.5.42) (2022-09-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.41](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.40...@standardnotes/files-server@1.5.41) (2022-09-05)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.40](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.39...@standardnotes/files-server@1.5.40) (2022-09-05)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.39](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.38...@standardnotes/files-server@1.5.39) (2022-09-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.38](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.37...@standardnotes/files-server@1.5.38) (2022-09-01)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.37](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.36...@standardnotes/files-server@1.5.37) (2022-08-30)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.36](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.35...@standardnotes/files-server@1.5.36) (2022-08-29)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.35](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.34...@standardnotes/files-server@1.5.35) (2022-08-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.34](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.33...@standardnotes/files-server@1.5.34) (2022-08-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.33](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.32...@standardnotes/files-server@1.5.33) (2022-08-10)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.32](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.31...@standardnotes/files-server@1.5.32) (2022-08-09)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.31](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.30...@standardnotes/files-server@1.5.31) (2022-08-08)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.30](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.29...@standardnotes/files-server@1.5.30) (2022-07-27)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.29](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.28...@standardnotes/files-server@1.5.29) (2022-07-27)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.28](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.27...@standardnotes/files-server@1.5.28) (2022-07-26)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.27](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.26...@standardnotes/files-server@1.5.27) (2022-07-25)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.26](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.25...@standardnotes/files-server@1.5.26) (2022-07-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.25](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.24...@standardnotes/files-server@1.5.25) (2022-07-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.24](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.23...@standardnotes/files-server@1.5.24) (2022-07-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.23](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.22...@standardnotes/files-server@1.5.23) (2022-07-15)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.22](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.21...@standardnotes/files-server@1.5.22) (2022-07-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.21](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.20...@standardnotes/files-server@1.5.21) (2022-07-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.20](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.19...@standardnotes/files-server@1.5.20) (2022-07-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.19](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.18...@standardnotes/files-server@1.5.19) (2022-07-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.18](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.17...@standardnotes/files-server@1.5.18) (2022-07-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.17](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.16...@standardnotes/files-server@1.5.17) (2022-07-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.16](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.15...@standardnotes/files-server@1.5.16) (2022-07-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.15](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.14...@standardnotes/files-server@1.5.15) (2022-07-14)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.14](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.13...@standardnotes/files-server@1.5.14) (2022-07-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.13](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.12...@standardnotes/files-server@1.5.13) (2022-07-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.12](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.11...@standardnotes/files-server@1.5.12) (2022-07-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.11](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.10...@standardnotes/files-server@1.5.11) (2022-07-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.10](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.9...@standardnotes/files-server@1.5.10) (2022-07-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.9](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.8...@standardnotes/files-server@1.5.9) (2022-07-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.8](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.7...@standardnotes/files-server@1.5.8) (2022-07-13)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.6...@standardnotes/files-server@1.5.7) (2022-07-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.5...@standardnotes/files-server@1.5.6) (2022-07-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.4...@standardnotes/files-server@1.5.5) (2022-07-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.3...@standardnotes/files-server@1.5.4) (2022-07-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.2...@standardnotes/files-server@1.5.3) (2022-07-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.1...@standardnotes/files-server@1.5.2) (2022-07-12)

**Note:** Version bump only for package @standardnotes/files-server

## [1.5.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.5.0...@standardnotes/files-server@1.5.1) (2022-07-11)

**Note:** Version bump only for package @standardnotes/files-server

# [1.5.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.4.0...@standardnotes/files-server@1.5.0) (2022-07-06)

### Features

* add sncryptio-node package ([60e8974](https://github.com/standardnotes/files/commit/60e8974580d498e7edf80813c32268a8bf7eda39))

# [1.4.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.3.0...@standardnotes/files-server@1.4.0) (2022-07-06)

### Features

* add common package ([fd4ee21](https://github.com/standardnotes/files/commit/fd4ee2123dc72b4d8755504d57bced608c1ab928))

# [1.3.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.2.0...@standardnotes/files-server@1.3.0) (2022-07-06)

### Features

* add time package ([565e890](https://github.com/standardnotes/files/commit/565e890973b1d96544bb750fdd700d58f8dad088))

# [1.2.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.14...@standardnotes/files-server@1.2.0) (2022-07-06)

### Bug Fixes

* deps to @standarnotes/security ([699164e](https://github.com/standardnotes/files/commit/699164eba553cd07fb50f7a06ae8991028167603))

### Features

* add security package ([d86928f](https://github.com/standardnotes/files/commit/d86928f1b4b5feda8c330ed8ee0bf9de0fc12ae7))

## [1.1.14](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.13...@standardnotes/files-server@1.1.14) (2022-07-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.1.13](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.12...@standardnotes/files-server@1.1.13) (2022-07-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.1.12](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.11...@standardnotes/files-server@1.1.12) (2022-07-06)

**Note:** Version bump only for package @standardnotes/files-server

## [1.1.11](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.10...@standardnotes/files-server@1.1.11) (2022-07-06)

### Bug Fixes

* testing project packages ([d818799](https://github.com/standardnotes/files/commit/d818799418d3681c60ba1758b9d5dda945aed5a7))

## [1.1.10](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.9...@standardnotes/files-server@1.1.10) (2022-07-06)

### Bug Fixes

* publishing setup ([caaad92](https://github.com/standardnotes/files/commit/caaad9205cbf5e7fcec8d703d6257c3e616133e4))

## [1.1.9](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.8...@standardnotes/files-server@1.1.9) (2022-07-04)

**Note:** Version bump only for package @standardnotes/files-server

## [1.1.8](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.7...@standardnotes/files-server@1.1.8) (2022-06-28)

**Note:** Version bump only for package @standardnotes/files-server

## [1.1.7](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.6...@standardnotes/files-server@1.1.7) (2022-06-27)

**Note:** Version bump only for package @standardnotes/files-server

## [1.1.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.5...@standardnotes/files-server@1.1.6) (2022-06-27)

**Note:** Version bump only for package @standardnotes/files-server

## [1.1.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.4...@standardnotes/files-server@1.1.5) (2022-06-27)

### Bug Fixes

* upgrade sentry node sdk ([b6db194](https://github.com/standardnotes/files/commit/b6db194a22ff1d0afe96c291d545b408c0a5c373))

## [1.1.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.3...@standardnotes/files-server@1.1.4) (2022-06-24)

### Bug Fixes

* newrelic deps and setup db and cache for local development purposes ([ff09ae0](https://github.com/standardnotes/files/commit/ff09ae0a47747eaf7977ce5d3937ad385101eaeb))

## [1.1.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.2...@standardnotes/files-server@1.1.3) (2022-06-23)

### Bug Fixes

* curl in the final image ([0d67c55](https://github.com/standardnotes/files/commit/0d67c55e124eed08bca16824750152b895fceca7))

## [1.1.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.1...@standardnotes/files-server@1.1.2) (2022-06-23)

**Note:** Version bump only for package @standardnotes/files-server

## [1.1.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.0...@standardnotes/files-server@1.1.1) (2022-06-23)

**Note:** Version bump only for package @standardnotes/files-server

# [1.1.0](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.0-alpha.6...@standardnotes/files-server@1.1.0) (2022-06-23)

**Note:** Version bump only for package @standardnotes/files-server

# [1.1.0-alpha.6](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.0-alpha.5...@standardnotes/files-server@1.1.0-alpha.6) (2022-06-23)

**Note:** Version bump only for package @standardnotes/files-server

# [1.1.0-alpha.5](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.0-alpha.4...@standardnotes/files-server@1.1.0-alpha.5) (2022-06-23)

**Note:** Version bump only for package @standardnotes/files-server

# [1.1.0-alpha.4](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.0-alpha.3...@standardnotes/files-server@1.1.0-alpha.4) (2022-06-23)

### Bug Fixes

* add missing curl to docker image for healthcheck purposes ([7efb48d](https://github.com/standardnotes/files/commit/7efb48dd2a6066c29601d34bfcbfe6231f644c50))

# [1.1.0-alpha.3](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.0-alpha.2...@standardnotes/files-server@1.1.0-alpha.3) (2022-06-23)

**Note:** Version bump only for package @standardnotes/files-server

# [1.1.0-alpha.2](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.0-alpha.1...@standardnotes/files-server@1.1.0-alpha.2) (2022-06-23)

### Features

* add api-gateway package ([57c3b9c](https://github.com/standardnotes/files/commit/57c3b9c29e5b16449c864e59dbc1fd11689125f9))

# [1.1.0-alpha.1](https://github.com/standardnotes/files/compare/@standardnotes/files-server@1.1.0-alpha.0...@standardnotes/files-server@1.1.0-alpha.1) (2022-06-22)

**Note:** Version bump only for package @standardnotes/files-server

# 1.1.0-alpha.0 (2022-06-22)

### Features

* add files server package ([7a8a5fc](https://github.com/standardnotes/files/commit/7a8a5fcfdfe0f9cad51114b43cdae748e297b543))
