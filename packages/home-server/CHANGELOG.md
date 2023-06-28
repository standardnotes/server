# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.11.13](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.12...@standardnotes/home-server@1.11.13) (2023-06-28)

**Note:** Version bump only for package @standardnotes/home-server

## [1.11.12](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.11...@standardnotes/home-server@1.11.12) (2023-06-28)

**Note:** Version bump only for package @standardnotes/home-server

## [1.11.11](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.10...@standardnotes/home-server@1.11.11) (2023-06-22)

### Bug Fixes

* **home-server:** destroy winston loggers upon server shutdown ([c7a394c](https://github.com/standardnotes/server/commit/c7a394cd1a696305796362cca25fea93e695a86a))

## [1.11.10](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.9...@standardnotes/home-server@1.11.10) (2023-06-22)

### Bug Fixes

* **home-server:** pass the log stream callback before loggers are created ([1ca70c1](https://github.com/standardnotes/server/commit/1ca70c1e504257a3753203c0b5630db3d446d393))

## [1.11.9](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.8...@standardnotes/home-server@1.11.9) (2023-06-22)

### Bug Fixes

* **home-server:** listening on log stream ([e38a164](https://github.com/standardnotes/server/commit/e38a16404c1b335ab0ef4d8383f6f644e51934ad))
* **home-server:** passthrough stream for loggers ([f17a1f8](https://github.com/standardnotes/server/commit/f17a1f875cd087115b06c8224342f6d102042767))

## [1.11.8](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.7...@standardnotes/home-server@1.11.8) (2023-06-22)

### Bug Fixes

* **home-server:** add debug logs about container initalizations ([0df4715](https://github.com/standardnotes/server/commit/0df471585fd5b4626ec2972f3b9a3e33b2830e65))

## [1.11.7](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.6...@standardnotes/home-server@1.11.7) (2023-06-22)

### Bug Fixes

* **home-server:** add default log level to overrides ([c078bc9](https://github.com/standardnotes/server/commit/c078bc958d96e856f6e607406d5d817d422572fb))
* **home-server:** add log leve information to starting the home server information ([49c2792](https://github.com/standardnotes/server/commit/49c27924eafa50c164854946053fd95e6429df9e))

## [1.11.6](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.5...@standardnotes/home-server@1.11.6) (2023-06-16)

### Bug Fixes

* **home-server:** unref the server instance when stopping the home server ([5ef90cc](https://github.com/standardnotes/server/commit/5ef90cc75b44133bf8065ce16f36d5b347c68122))

## [1.11.5](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.4...@standardnotes/home-server@1.11.5) (2023-06-14)

### Bug Fixes

* **home-server:** env var determining the sqlite database location ([#626](https://github.com/standardnotes/server/issues/626)) ([0cb5e36](https://github.com/standardnotes/server/commit/0cb5e36b20d9b095ea0edbcd877387e6c0069856))

## [1.11.4](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.3...@standardnotes/home-server@1.11.4) (2023-06-13)

### Bug Fixes

* **home-server:** encapsulate starting the server with a result return ([90a4f21](https://github.com/standardnotes/server/commit/90a4f2111f9e050e5fb500261c3e43eacc5622e4))

## [1.11.3](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.2...@standardnotes/home-server@1.11.3) (2023-06-12)

### Bug Fixes

* **home-server:** accept application/octet-stream requests for files ([#625](https://github.com/standardnotes/server/issues/625)) ([c8974b7](https://github.com/standardnotes/server/commit/c8974b7fa229ff4f1e026e1ebff50d1081cc5f8b))

## [1.11.2](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.1...@standardnotes/home-server@1.11.2) (2023-06-09)

**Note:** Version bump only for package @standardnotes/home-server

## [1.11.1](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.11.0...@standardnotes/home-server@1.11.1) (2023-06-09)

**Note:** Version bump only for package @standardnotes/home-server

# [1.11.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.10.0...@standardnotes/home-server@1.11.0) (2023-06-09)

### Features

* **home-server:** add activating premium features ([#624](https://github.com/standardnotes/server/issues/624)) ([72ce190](https://github.com/standardnotes/server/commit/72ce1909960fbd2ec6a47b8dbdfbe53a4f10e776))

# [1.10.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.9.0...@standardnotes/home-server@1.10.0) (2023-06-07)

### Features

* configurable path for uploads and db ([#623](https://github.com/standardnotes/server/issues/623)) ([af8feaa](https://github.com/standardnotes/server/commit/af8feaadfe2dd58baab4cca217d6307b4a221326))

# [1.9.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.8.5...@standardnotes/home-server@1.9.0) (2023-06-05)

### Features

* **home-server:** allow running the home server with a mysql and redis configuration ([#622](https://github.com/standardnotes/server/issues/622)) ([d6e531d](https://github.com/standardnotes/server/commit/d6e531d4b6c1c80a894f6d7ec93632595268dd64))

## [1.8.5](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.8.4...@standardnotes/home-server@1.8.5) (2023-06-02)

### Bug Fixes

* **home-server:** linter issues ([28cce39](https://github.com/standardnotes/server/commit/28cce39fe7a75fec035f920573271e1e56421818))
* **home-server:** streaming logs ([a8b806a](https://github.com/standardnotes/server/commit/a8b806af084b3e3fe8707ff0cb041a74042ee049))

## [1.8.4](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.8.3...@standardnotes/home-server@1.8.4) (2023-06-02)

### Bug Fixes

* **home-server:** remove redundant restart method ([58ab410](https://github.com/standardnotes/server/commit/58ab410b0afb1d811247cd65b2585d06f9c8807a))

## [1.8.3](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.8.2...@standardnotes/home-server@1.8.3) (2023-06-02)

### Bug Fixes

* **home-server:** add default for VERSION environment variable ([2f569d4](https://github.com/standardnotes/server/commit/2f569d41047a802eb72ef1a3618ffe4df28a709c))
* **home-server:** displaying the port on which it is running ([1e62a37](https://github.com/standardnotes/server/commit/1e62a3760e3b9601478c851cf33db2f2b348d7fb))

## [1.8.2](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.8.1...@standardnotes/home-server@1.8.2) (2023-06-02)

### Bug Fixes

* **home-server:** default configuration variables ([e6e9a32](https://github.com/standardnotes/server/commit/e6e9a32f0385789e5e772e5cabcc0da0b8ccbb01))

## [1.8.1](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.8.0...@standardnotes/home-server@1.8.1) (2023-06-02)

**Note:** Version bump only for package @standardnotes/home-server

# [1.8.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.7.5...@standardnotes/home-server@1.8.0) (2023-06-02)

### Features

* **home-server:** add overriding environment variables in underlying services ([#621](https://github.com/standardnotes/server/issues/621)) ([f0cbec0](https://github.com/standardnotes/server/commit/f0cbec07b87d60dfad92072944553f76e0bea164))

## [1.7.5](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.7.4...@standardnotes/home-server@1.7.5) (2023-06-01)

**Note:** Version bump only for package @standardnotes/home-server

## [1.7.4](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.7.3...@standardnotes/home-server@1.7.4) (2023-06-01)

**Note:** Version bump only for package @standardnotes/home-server

## [1.7.3](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.7.2...@standardnotes/home-server@1.7.3) (2023-06-01)

**Note:** Version bump only for package @standardnotes/home-server

## [1.7.2](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.7.1...@standardnotes/home-server@1.7.2) (2023-06-01)

**Note:** Version bump only for package @standardnotes/home-server

## [1.7.1](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.7.0...@standardnotes/home-server@1.7.1) (2023-05-31)

**Note:** Version bump only for package @standardnotes/home-server

# [1.7.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.6.7...@standardnotes/home-server@1.7.0) (2023-05-31)

### Features

* **home-server:** add custom home server logs ([#619](https://github.com/standardnotes/server/issues/619)) ([bc63d0a](https://github.com/standardnotes/server/commit/bc63d0aeea86abbb4a144b2682b7070d7bdfe878))

## [1.6.7](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.6.6...@standardnotes/home-server@1.6.7) (2023-05-31)

**Note:** Version bump only for package @standardnotes/home-server

## [1.6.6](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.6.5...@standardnotes/home-server@1.6.6) (2023-05-31)

**Note:** Version bump only for package @standardnotes/home-server

## [1.6.5](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.6.4...@standardnotes/home-server@1.6.5) (2023-05-31)

### Bug Fixes

* **home-server:** make the package publishable ([56a312f](https://github.com/standardnotes/server/commit/56a312f21730b32b766c358a5ceb0865722bac46))

## [1.6.4](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.6.3...@standardnotes/home-server@1.6.4) (2023-05-30)

**Note:** Version bump only for package @standardnotes/home-server

## [1.6.3](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.6.2...@standardnotes/home-server@1.6.3) (2023-05-30)

**Note:** Version bump only for package @standardnotes/home-server

## [1.6.2](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.6.1...@standardnotes/home-server@1.6.2) (2023-05-30)

**Note:** Version bump only for package @standardnotes/home-server

## [1.6.1](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.6.0...@standardnotes/home-server@1.6.1) (2023-05-30)

**Note:** Version bump only for package @standardnotes/home-server

# [1.6.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.5.1...@standardnotes/home-server@1.6.0) (2023-05-29)

### Features

* add files server as a service to home-server ([#614](https://github.com/standardnotes/server/issues/614)) ([c7d575a](https://github.com/standardnotes/server/commit/c7d575a0ffc7eb3e8799c3835da5727584f4f67b))

## [1.5.1](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.5.0...@standardnotes/home-server@1.5.1) (2023-05-25)

**Note:** Version bump only for package @standardnotes/home-server

# [1.5.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.4.4...@standardnotes/home-server@1.5.0) (2023-05-25)

### Features

* add revisions service to home server ([#613](https://github.com/standardnotes/server/issues/613)) ([c70040f](https://github.com/standardnotes/server/commit/c70040fe5dfd35663b9811fbbaa9370bd0298482))

## [1.4.4](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.4.3...@standardnotes/home-server@1.4.4) (2023-05-25)

**Note:** Version bump only for package @standardnotes/home-server

## [1.4.3](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.4.2...@standardnotes/home-server@1.4.3) (2023-05-18)

**Note:** Version bump only for package @standardnotes/home-server

## [1.4.2](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.4.1...@standardnotes/home-server@1.4.2) (2023-05-18)

### Bug Fixes

* **api-gateway:** decorating responses for direct call proxy ([4ab32c6](https://github.com/standardnotes/server/commit/4ab32c670eedcfc64611a191bc25566d43372b23))

## [1.4.1](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.4.0...@standardnotes/home-server@1.4.1) (2023-05-18)

**Note:** Version bump only for package @standardnotes/home-server

# [1.4.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.3.1...@standardnotes/home-server@1.4.0) (2023-05-17)

### Features

* bundle syncing server into home server setup ([#611](https://github.com/standardnotes/server/issues/611)) ([b3b617e](https://github.com/standardnotes/server/commit/b3b617ea0b4f4574f6aa7cfae0e9fa8f868f1f4c))

## [1.3.1](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.3.0...@standardnotes/home-server@1.3.1) (2023-05-17)

**Note:** Version bump only for package @standardnotes/home-server

# [1.3.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.2.0...@standardnotes/home-server@1.3.0) (2023-05-17)

### Features

* add direct event handling for home server ([#608](https://github.com/standardnotes/server/issues/608)) ([8a47d81](https://github.com/standardnotes/server/commit/8a47d81936acd765224e74fd083810579a83c9a7))

# [1.2.0](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.1.1...@standardnotes/home-server@1.2.0) (2023-05-16)

### Features

* home-server package initial setup with Api Gateway and Auth services ([#605](https://github.com/standardnotes/server/issues/605)) ([dc71e67](https://github.com/standardnotes/server/commit/dc71e6777fc4c51234b79f6fb409f9f3111cc6a5))

## [1.1.1](https://github.com/standardnotes/server/compare/@standardnotes/home-server@1.1.0...@standardnotes/home-server@1.1.1) (2023-05-15)

**Note:** Version bump only for package @standardnotes/home-server

# 1.1.0 (2023-05-09)

### Features

* **home-server:** add boilerplate ([#601](https://github.com/standardnotes/server/issues/601)) ([750cd26](https://github.com/standardnotes/server/commit/750cd26c369e7d93fa3da29dbe41823059252639))
