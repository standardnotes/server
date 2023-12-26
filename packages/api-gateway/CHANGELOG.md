# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.89.6](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.89.5...@standardnotes/api-gateway@1.89.6) (2023-12-26)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.89.5](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.89.4...@standardnotes/api-gateway@1.89.5) (2023-12-22)

### Bug Fixes

* logs severity ([0762ed1](https://github.com/standardnotes/server/commit/0762ed1127a5de295bd50c14afad31c7fb88a853))

## [1.89.4](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.89.3...@standardnotes/api-gateway@1.89.4) (2023-12-22)

### Bug Fixes

* case sensitive typo ([b1cb6a1](https://github.com/standardnotes/server/commit/b1cb6a1d21479b67d9826b55e1221a803e2f41a7))

## [1.89.3](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.89.2...@standardnotes/api-gateway@1.89.3) (2023-12-22)

### Bug Fixes

* add more readonly access debug logs ([54091f2](https://github.com/standardnotes/server/commit/54091f23da33a5d1df2ecffdfa559e3fa4c562f6))
* **api-gateway:** add debug log for operating on readonly access ([e4a8324](https://github.com/standardnotes/server/commit/e4a8324db26454a7587f37096653ad9565541295))

## [1.89.2](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.89.1...@standardnotes/api-gateway@1.89.2) (2023-12-21)

### Bug Fixes

* **api-gateway:** missing readonly access for demo when utilizing grpc workflow ([#1005](https://github.com/standardnotes/server/issues/1005)) ([e551a36](https://github.com/standardnotes/server/commit/e551a364f63e28c9329dbce492488b9f112e3473))

## [1.89.1](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.89.0...@standardnotes/api-gateway@1.89.1) (2023-12-14)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.89.0](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.88.4...@standardnotes/api-gateway@1.89.0) (2023-12-12)

### Features

* **syncing-server:** add extended revisions frequency for free users ([#965](https://github.com/standardnotes/server/issues/965)) ([398c10c](https://github.com/standardnotes/server/commit/398c10ce4b8e357728a8b4f354b3bf6ccc8e438d))

## [1.88.4](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.88.3...@standardnotes/api-gateway@1.88.4) (2023-12-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.88.3](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.88.2...@standardnotes/api-gateway@1.88.3) (2023-12-08)

### Bug Fixes

* **api-gateway:** add extra meta to logs ([a341e78](https://github.com/standardnotes/server/commit/a341e789093556f09c2a337e39a8053abdcf587b))

## [1.88.2](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.88.1...@standardnotes/api-gateway@1.88.2) (2023-12-07)

### Bug Fixes

* **api-gateway:** add userId to logs in error handler if possible ([0058368](https://github.com/standardnotes/server/commit/005836868126ae5fa4c4468644704938aea0f4ec))

## [1.88.1](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.88.0...@standardnotes/api-gateway@1.88.1) (2023-12-07)

### Bug Fixes

* **api-gateway:** response header on grpc websocket connection validation ([3637db2](https://github.com/standardnotes/server/commit/3637db2563255aaddd44700c039495c6b9a9e4aa))
* logger meta information ([a2b1323](https://github.com/standardnotes/server/commit/a2b1323568f5ced74b41aa4634340a6ca0668683))

# [1.88.0](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.87.7...@standardnotes/api-gateway@1.88.0) (2023-12-07)

### Features

* replace websocket connection validation with grpc ([#954](https://github.com/standardnotes/server/issues/954)) ([d5c1b76](https://github.com/standardnotes/server/commit/d5c1b76de068a64b334c4347cbefa973447a0f60))

## [1.87.7](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.87.6...@standardnotes/api-gateway@1.87.7) (2023-12-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.87.6](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.87.5...@standardnotes/api-gateway@1.87.6) (2023-12-06)

### Bug Fixes

* **api-gateway:** add grpc logs for internal errors ([529795d](https://github.com/standardnotes/server/commit/529795d393442727833f318234d308543c1ea731))

## [1.87.5](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.87.4...@standardnotes/api-gateway@1.87.5) (2023-12-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.87.4](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.87.3...@standardnotes/api-gateway@1.87.4) (2023-12-01)

### Bug Fixes

* **api-gateway:** home server home page ([#949](https://github.com/standardnotes/server/issues/949)) ([a82192d](https://github.com/standardnotes/server/commit/a82192db42dfbb3eea4ac6af40ef2b3d6126e5a3))

## [1.87.3](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.87.2...@standardnotes/api-gateway@1.87.3) (2023-11-28)

### Bug Fixes

* **api-gateway:** add session to response locals from web socket middleware ([4cc647a](https://github.com/standardnotes/server/commit/4cc647ac07b2471d6616a913bcdca431c506fd0e))

## [1.87.2](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.87.1...@standardnotes/api-gateway@1.87.2) (2023-11-28)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.87.1](https://github.com/standardnotes/server/compare/@standardnotes/api-gateway@1.87.0...@standardnotes/api-gateway@1.87.1) (2023-11-27)

### Bug Fixes

* repository config in package.json files ([ed1bf37](https://github.com/standardnotes/server/commit/ed1bf37287af23a25b8388ada95f0acdec8f71ea))

# [1.87.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.86.6...@standardnotes/api-gateway@1.87.0) (2023-11-27)

### Features

* add npm provenance to published packages ([e836abd](https://github.com/standardnotes/api-gateway/commit/e836abdef73d246940d8fffd9e65e17c64cd35c8))

## [1.86.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.86.5...@standardnotes/api-gateway@1.86.6) (2023-11-23)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.86.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.86.4...@standardnotes/api-gateway@1.86.5) (2023-11-22)

### Bug Fixes

* error handling on gRPC ([#937](https://github.com/standardnotes/api-gateway/issues/937)) ([8f23c8a](https://github.com/standardnotes/api-gateway/commit/8f23c8ab3f03e9c23adfb31a33c5805492bc2f5b))

## [1.86.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.86.3...@standardnotes/api-gateway@1.86.4) (2023-11-22)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.86.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.86.2...@standardnotes/api-gateway@1.86.3) (2023-11-21)

### Bug Fixes

* **api-gateway:** add meta field to grpc sync calls ([#934](https://github.com/standardnotes/api-gateway/issues/934)) ([c5c24b3](https://github.com/standardnotes/api-gateway/commit/c5c24b3ac9dbd559d96adc56270d724a3156ebd4))

## [1.86.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.86.1...@standardnotes/api-gateway@1.86.2) (2023-11-20)

### Bug Fixes

* define grpc max message size ([bfef16c](https://github.com/standardnotes/api-gateway/commit/bfef16ce3757b57ea1cb0cb7417d6bc935a52321))

## [1.86.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.86.0...@standardnotes/api-gateway@1.86.1) (2023-11-20)

### Bug Fixes

* setting gzip as default compression on grpc calls ([#933](https://github.com/standardnotes/api-gateway/issues/933)) ([2dff6a2](https://github.com/standardnotes/api-gateway/commit/2dff6a2ed3d105ca65996d47321a811e22e25099))

# [1.86.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.85.1...@standardnotes/api-gateway@1.86.0) (2023-11-20)

### Features

* **grpc:** add syncing protocol buffers ([#930](https://github.com/standardnotes/api-gateway/issues/930)) ([5b84f07](https://github.com/standardnotes/api-gateway/commit/5b84f078c6ae6330706895f7c57b67ff8c8d18ae))

## [1.85.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.85.0...@standardnotes/api-gateway@1.85.1) (2023-11-16)

### Bug Fixes

* **api-gateway:** remove overly verbose debug messages ([ed05ea5](https://github.com/standardnotes/api-gateway/commit/ed05ea553f605234cd8803e633f3c07429877dbb))

# [1.85.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.84.1...@standardnotes/api-gateway@1.85.0) (2023-11-16)

### Features

* add debug logs for grpc communication ([6391a01](https://github.com/standardnotes/api-gateway/commit/6391a01b5703db23b566710d0520c1197c46144b))

## [1.84.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.84.0...@standardnotes/api-gateway@1.84.1) (2023-11-16)

### Bug Fixes

* **api-gateway:** bindings ([78fbeb5](https://github.com/standardnotes/api-gateway/commit/78fbeb595f9e213688bcb2a031fba2aa3974cc6a))

# [1.84.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.83.5...@standardnotes/api-gateway@1.84.0) (2023-11-16)

### Features

* add grpc sessions validation server ([#928](https://github.com/standardnotes/api-gateway/issues/928)) ([4f62cac](https://github.com/standardnotes/api-gateway/commit/4f62cac213a6b5f503040ef6319e5198967974ce))

## [1.83.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.83.4...@standardnotes/api-gateway@1.83.5) (2023-11-14)

### Bug Fixes

* **api-gateway:** remove the verify body function ([3ddd671](https://github.com/standardnotes/api-gateway/commit/3ddd671c4797482a396844e804b4b45b82dbff2d))
* **api-gateway:** remove unused imports ([fd997f4](https://github.com/standardnotes/api-gateway/commit/fd997f4849ed01ef3ae4baf52b5895012fa711d4))

## [1.83.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.83.3...@standardnotes/api-gateway@1.83.4) (2023-11-14)

### Bug Fixes

* **api-gateway:** add verification if json is valid on request ([420bf9e](https://github.com/standardnotes/api-gateway/commit/420bf9ec5460a9693cc382e9164b4bdbb9b769a1))
* **api-gateway:** buffer encoding ([2823ed8](https://github.com/standardnotes/api-gateway/commit/2823ed8612cb9797d43e847edac5e2bdc0fe7426))
* **api-gateway:** checking for buffer length ([f65809e](https://github.com/standardnotes/api-gateway/commit/f65809ef3052d05df2e3f012a9b6340d18a6deae))

## [1.83.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.83.2...@standardnotes/api-gateway@1.83.3) (2023-11-13)

### Bug Fixes

* **api-gateway:** add application version to the error logs ([daed1a7](https://github.com/standardnotes/api-gateway/commit/daed1a77a02559a8487896b6fb8299befe8a2d96))
* **api-gateway:** add request method to the debug logs ([b39eb09](https://github.com/standardnotes/api-gateway/commit/b39eb09d91f0ea9482d27578faecdf57ed2ea48e))

## [1.83.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.83.1...@standardnotes/api-gateway@1.83.2) (2023-11-13)

### Bug Fixes

* **api-gateway:** debug log on error thrown body representation ([c8bf4ab](https://github.com/standardnotes/api-gateway/commit/c8bf4ab3a0ab757092077fc594e3ca7e090116b4))

## [1.83.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.83.0...@standardnotes/api-gateway@1.83.1) (2023-11-13)

### Bug Fixes

* **api-gateway:** add debug logs for errors on parsing ([60686dc](https://github.com/standardnotes/api-gateway/commit/60686dcdbd59c0d99cd1857a82ad62baed088b25))

# [1.83.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.82.1...@standardnotes/api-gateway@1.83.0) (2023-11-10)

### Bug Fixes

* **api-gateway:** add more info on error logs ([f997501](https://github.com/standardnotes/api-gateway/commit/f99750169f4d24cdc7530184af2230c687f3e166))

### Features

* add keep-alive connections to subservices ([#924](https://github.com/standardnotes/api-gateway/issues/924)) ([daad76d](https://github.com/standardnotes/api-gateway/commit/daad76d0ddae34c59dce45eedc4a055c4a11456d))

## [1.82.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.82.0...@standardnotes/api-gateway@1.82.1) (2023-11-10)

### Bug Fixes

* **api-gateway:** websockets calls logs severity ([a9b1543](https://github.com/standardnotes/api-gateway/commit/a9b1543e204afeab1fa2e008327c39cf306a247c))

# [1.82.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.14...@standardnotes/api-gateway@1.82.0) (2023-11-10)

### Features

* add graceful shutdown procedures upon SIGTERM ([#923](https://github.com/standardnotes/api-gateway/issues/923)) ([c24353c](https://github.com/standardnotes/api-gateway/commit/c24353cc24ebf4b40ff9a2cec8e37cfdef109e37))

## [1.81.14](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.13...@standardnotes/api-gateway@1.81.14) (2023-11-10)

### Bug Fixes

* **api-gateway:** add logs about calling web sockets with minimal format ([5d3fb9a](https://github.com/standardnotes/api-gateway/commit/5d3fb9a537f6971cfe8ae3c5ea449806cc4de8a0))

## [1.81.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.12...@standardnotes/api-gateway@1.81.13) (2023-11-09)

### Bug Fixes

* **api-gateway:** add possibility to configure keep-alive timeout ([#920](https://github.com/standardnotes/api-gateway/issues/920)) ([16f92bd](https://github.com/standardnotes/api-gateway/commit/16f92bdc990ded5c3f1fe5af1e6e4a113a9954de))

## [1.81.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.11...@standardnotes/api-gateway@1.81.12) (2023-11-09)

### Bug Fixes

* reduce websockets api communication data ([#919](https://github.com/standardnotes/api-gateway/issues/919)) ([c4ae12d](https://github.com/standardnotes/api-gateway/commit/c4ae12d53fc166879f90a4c5dbad1ab1cb4797e2))

## [1.81.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.10...@standardnotes/api-gateway@1.81.11) (2023-11-07)

### Bug Fixes

* **api-gateway:** remove calling both auth and payments on account deletion request ([6b554c2](https://github.com/standardnotes/api-gateway/commit/6b554c28b731a9080d7ad2942d3fa05c01dcabf2))

## [1.81.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.9...@standardnotes/api-gateway@1.81.10) (2023-11-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.81.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.8...@standardnotes/api-gateway@1.81.9) (2023-11-07)

### Bug Fixes

* remove open telemetry from code ([#903](https://github.com/standardnotes/api-gateway/issues/903)) ([751f3b2](https://github.com/standardnotes/api-gateway/commit/751f3b25476c5be3d663ad8540c43266acd39493))

## [1.81.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.7...@standardnotes/api-gateway@1.81.8) (2023-11-03)

### Bug Fixes

* retry attempts on session validation and more verbose logs ([#898](https://github.com/standardnotes/api-gateway/issues/898)) ([3e376c4](https://github.com/standardnotes/api-gateway/commit/3e376c44e3a6c336dcff3d8ef5eb3ab040d9a561))

## [1.81.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.6...@standardnotes/api-gateway@1.81.7) (2023-10-31)

### Bug Fixes

* add fallback methods for 404 requests ([#893](https://github.com/standardnotes/api-gateway/issues/893)) ([16a6815](https://github.com/standardnotes/api-gateway/commit/16a6815b69e344573ae07682f3bac1d44d715d79))

## [1.81.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.5...@standardnotes/api-gateway@1.81.6) (2023-10-27)

### Bug Fixes

* **api-gateway:** logs for errors reaching service ([14bcf7b](https://github.com/standardnotes/api-gateway/commit/14bcf7b6c9403c3413e7579f58ea17168d14dce7))

## [1.81.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.4...@standardnotes/api-gateway@1.81.5) (2023-10-26)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.81.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.3...@standardnotes/api-gateway@1.81.4) (2023-10-26)

### Bug Fixes

* **api-gateway:** retry attempts and logs ([654663d](https://github.com/standardnotes/api-gateway/commit/654663d17f6eee15f7bf2bc7f40e6c37a3d8e53c))

## [1.81.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.2...@standardnotes/api-gateway@1.81.3) (2023-10-26)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.81.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.1...@standardnotes/api-gateway@1.81.2) (2023-10-20)

### Bug Fixes

* **api-gateway:** add session validation retry attempts on timedout requests ([6aee51b](https://github.com/standardnotes/api-gateway/commit/6aee51bd45c25e85d01075a9c8d2854b32dd6e3c))

## [1.81.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.81.0...@standardnotes/api-gateway@1.81.1) (2023-10-20)

### Bug Fixes

* **api-gateway:** logs severity on retry attempts ([1c3d19c](https://github.com/standardnotes/api-gateway/commit/1c3d19cca43a7a3eba2b0d05c820de5112edf89e))

# [1.81.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.80.1...@standardnotes/api-gateway@1.81.0) (2023-10-20)

### Features

* **api-gateway:** add retry attempts on timedout requests ([#885](https://github.com/standardnotes/api-gateway/issues/885)) ([ce35767](https://github.com/standardnotes/api-gateway/commit/ce357679e9bc704ab562e9d6ca192f49a794a664))

## [1.80.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.80.0...@standardnotes/api-gateway@1.80.1) (2023-10-19)

### Bug Fixes

* **api-gateway:** stringify error in service proxy ([e385926](https://github.com/standardnotes/api-gateway/commit/e38592604644e0f52df0865ffae5b7e79d1d3d07))

# [1.80.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.14...@standardnotes/api-gateway@1.80.0) (2023-10-19)

### Features

* remove transition state ([#882](https://github.com/standardnotes/api-gateway/issues/882)) ([a2c1ebe](https://github.com/standardnotes/api-gateway/commit/a2c1ebe675cd5678c923715056a6966f465a15d6))

## [1.79.14](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.13...@standardnotes/api-gateway@1.79.14) (2023-10-18)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.12...@standardnotes/api-gateway@1.79.13) (2023-10-17)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.11...@standardnotes/api-gateway@1.79.12) (2023-10-13)

### Bug Fixes

* reduce the amount of metrics gathered in telemetery ([32fe8d0](https://github.com/standardnotes/api-gateway/commit/32fe8d0a8523d6e1875cd0814c0cbdf27d8df7b3))

## [1.79.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.10...@standardnotes/api-gateway@1.79.11) (2023-10-12)

### Bug Fixes

* passing key params for backup requests ([#867](https://github.com/standardnotes/api-gateway/issues/867)) ([0739816](https://github.com/standardnotes/api-gateway/commit/07398169c80e7871cd04d889f471c3eef70e1aae))

## [1.79.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.9...@standardnotes/api-gateway@1.79.10) (2023-10-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.8...@standardnotes/api-gateway@1.79.9) (2023-10-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.7...@standardnotes/api-gateway@1.79.8) (2023-10-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.6...@standardnotes/api-gateway@1.79.7) (2023-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.5...@standardnotes/api-gateway@1.79.6) (2023-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.4...@standardnotes/api-gateway@1.79.5) (2023-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.3...@standardnotes/api-gateway@1.79.4) (2023-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.2...@standardnotes/api-gateway@1.79.3) (2023-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.1...@standardnotes/api-gateway@1.79.2) (2023-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.79.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.79.0...@standardnotes/api-gateway@1.79.1) (2023-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.79.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.78.6...@standardnotes/api-gateway@1.79.0) (2023-10-10)

### Features

* remove newrelic integration ([#862](https://github.com/standardnotes/api-gateway/issues/862)) ([efb341e](https://github.com/standardnotes/api-gateway/commit/efb341eb991d37efab7c1efce035ee07ad0a101e))

## [1.78.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.78.5...@standardnotes/api-gateway@1.78.6) (2023-10-10)

### Bug Fixes

* opentelemetry instantiation ([08f7c54](https://github.com/standardnotes/api-gateway/commit/08f7c5447b020fee71a1e49d382db32082bb9044))

## [1.78.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.78.4...@standardnotes/api-gateway@1.78.5) (2023-10-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.78.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.78.3...@standardnotes/api-gateway@1.78.4) (2023-10-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.78.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.78.2...@standardnotes/api-gateway@1.78.3) (2023-10-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.78.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.78.1...@standardnotes/api-gateway@1.78.2) (2023-10-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.78.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.78.0...@standardnotes/api-gateway@1.78.1) (2023-10-09)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.78.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.77.2...@standardnotes/api-gateway@1.78.0) (2023-10-09)

### Features

* add opentelemetry to all services ([5e930d0](https://github.com/standardnotes/api-gateway/commit/5e930d08eb60a0da800081342315e7edaf130951))

## [1.77.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.77.1...@standardnotes/api-gateway@1.77.2) (2023-10-09)

### Bug Fixes

* remove xray sdk in favor of opentelemetry ([b736dab](https://github.com/standardnotes/api-gateway/commit/b736dab3c1f76c9e03c4bc7bbf153dcb3309b7cb))

## [1.77.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.77.0...@standardnotes/api-gateway@1.77.1) (2023-10-06)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.77.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.76.2...@standardnotes/api-gateway@1.77.0) (2023-10-05)

### Features

* setting xray segment user on api-gateway level ([3ee4941](https://github.com/standardnotes/api-gateway/commit/3ee49416f8e19207540141d98baa7f68880929bd))

## [1.76.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.76.1...@standardnotes/api-gateway@1.76.2) (2023-10-05)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.76.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.76.0...@standardnotes/api-gateway@1.76.1) (2023-10-05)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.76.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.13...@standardnotes/api-gateway@1.76.0) (2023-10-04)

### Features

* **api-gateaway:** configure aws-xray-sdk ([dc76113](https://github.com/standardnotes/api-gateway/commit/dc7611391515dd49a8e9b7ce8ac5e128cd7af0a8))

## [1.75.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.12...@standardnotes/api-gateway@1.75.13) (2023-10-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.11...@standardnotes/api-gateway@1.75.12) (2023-10-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.10...@standardnotes/api-gateway@1.75.11) (2023-10-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.9...@standardnotes/api-gateway@1.75.10) (2023-10-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.8...@standardnotes/api-gateway@1.75.9) (2023-10-03)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.7...@standardnotes/api-gateway@1.75.8) (2023-10-03)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.6...@standardnotes/api-gateway@1.75.7) (2023-09-28)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.5...@standardnotes/api-gateway@1.75.6) (2023-09-27)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.4...@standardnotes/api-gateway@1.75.5) (2023-09-26)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.3...@standardnotes/api-gateway@1.75.4) (2023-09-25)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.2...@standardnotes/api-gateway@1.75.3) (2023-09-25)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.1...@standardnotes/api-gateway@1.75.2) (2023-09-25)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.75.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.75.0...@standardnotes/api-gateway@1.75.1) (2023-09-25)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.75.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.17...@standardnotes/api-gateway@1.75.0) (2023-09-21)

### Features

* add designating a survivor in shared vault ([#841](https://github.com/standardnotes/api-gateway/issues/841)) ([230c96d](https://github.com/standardnotes/api-gateway/commit/230c96dcf1d8faed9ce8fe288549226da70317e6))

## [1.74.17](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.16...@standardnotes/api-gateway@1.74.17) (2023-09-20)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.16](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.15...@standardnotes/api-gateway@1.74.16) (2023-09-20)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.15](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.14...@standardnotes/api-gateway@1.74.15) (2023-09-19)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.14](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.13...@standardnotes/api-gateway@1.74.14) (2023-09-18)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.12...@standardnotes/api-gateway@1.74.13) (2023-09-18)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.11...@standardnotes/api-gateway@1.74.12) (2023-09-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.10...@standardnotes/api-gateway@1.74.11) (2023-09-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.9...@standardnotes/api-gateway@1.74.10) (2023-09-13)

### Bug Fixes

* adjust transition timestamps to be universal ([c7807d0](https://github.com/standardnotes/api-gateway/commit/c7807d0f9e69ce572c4c03ff606375d706f24d9f))

## [1.74.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.8...@standardnotes/api-gateway@1.74.9) (2023-09-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.7...@standardnotes/api-gateway@1.74.8) (2023-09-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.6...@standardnotes/api-gateway@1.74.7) (2023-09-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.5...@standardnotes/api-gateway@1.74.6) (2023-09-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.4...@standardnotes/api-gateway@1.74.5) (2023-09-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.3...@standardnotes/api-gateway@1.74.4) (2023-09-11)

### Bug Fixes

* **api-gateway:** awaiting for other services to start ([0ab4701](https://github.com/standardnotes/api-gateway/commit/0ab47013f210dca7aa404966798011947fb5c362))

## [1.74.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.2...@standardnotes/api-gateway@1.74.3) (2023-09-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.1...@standardnotes/api-gateway@1.74.2) (2023-09-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.74.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.74.0...@standardnotes/api-gateway@1.74.1) (2023-09-07)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.74.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.73.7...@standardnotes/api-gateway@1.74.0) (2023-09-06)

### Features

* should be able to access shared item revisions as third party user ([#807](https://github.com/standardnotes/api-gateway/issues/807)) ([794cd87](https://github.com/standardnotes/api-gateway/commit/794cd8734acf89fb29f09dfb169a3f08f252bb6a))

## [1.73.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.73.6...@standardnotes/api-gateway@1.73.7) (2023-09-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.73.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.73.5...@standardnotes/api-gateway@1.73.6) (2023-09-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.73.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.73.4...@standardnotes/api-gateway@1.73.5) (2023-09-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.73.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.73.3...@standardnotes/api-gateway@1.73.4) (2023-09-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.73.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.73.2...@standardnotes/api-gateway@1.73.3) (2023-08-31)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.73.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.73.1...@standardnotes/api-gateway@1.73.2) (2023-08-31)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.73.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.73.0...@standardnotes/api-gateway@1.73.1) (2023-08-30)

### Bug Fixes

* **api-gateway:** transition triggering endpoint call for revisions ([ee656b8](https://github.com/standardnotes/api-gateway/commit/ee656b868b8ebcd63b568b48a450803c80fa78a6))

# [1.73.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.72.3...@standardnotes/api-gateway@1.73.0) (2023-08-30)

### Features

* add a way to trigger transition procedure for revisions ([#798](https://github.com/standardnotes/api-gateway/issues/798)) ([25ffd6b](https://github.com/standardnotes/api-gateway/commit/25ffd6b8036117b33584c6d948bb0867b637ae65))

## [1.72.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.72.2...@standardnotes/api-gateway@1.72.3) (2023-08-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.72.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.72.1...@standardnotes/api-gateway@1.72.2) (2023-08-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.72.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.72.0...@standardnotes/api-gateway@1.72.1) (2023-08-28)

### Bug Fixes

* allow self hosted to use new model of items ([#714](https://github.com/standardnotes/api-gateway/issues/714)) ([aef9254](https://github.com/standardnotes/api-gateway/commit/aef9254713560c00a90a3e84e3cd94417e8f30d2))

# [1.72.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.71.1...@standardnotes/api-gateway@1.72.0) (2023-08-24)

### Features

* add trigerring items transition and checking status of it ([#707](https://github.com/standardnotes/api-gateway/issues/707)) ([05bb12c](https://github.com/standardnotes/api-gateway/commit/05bb12c97899824f06e6d01d105dec75fc328440))

## [1.71.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.71.0...@standardnotes/api-gateway@1.71.1) (2023-08-23)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.71.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.70.5...@standardnotes/api-gateway@1.71.0) (2023-08-22)

### Features

* consider shared vault owner quota when uploading files to shared vault ([#704](https://github.com/standardnotes/api-gateway/issues/704)) ([34085ac](https://github.com/standardnotes/api-gateway/commit/34085ac6fb7e61d471bd3b4ae8e72112df25c3ee))

## [1.70.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.70.4...@standardnotes/api-gateway@1.70.5) (2023-08-18)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.70.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.70.3...@standardnotes/api-gateway@1.70.4) (2023-08-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.70.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.70.2...@standardnotes/api-gateway@1.70.3) (2023-08-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.70.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.70.1...@standardnotes/api-gateway@1.70.2) (2023-08-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.70.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.70.0...@standardnotes/api-gateway@1.70.1) (2023-08-08)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.70.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.69.3...@standardnotes/api-gateway@1.70.0) (2023-08-07)

### Features

* **syncing-server:** limit shared vaults creation based on role ([#687](https://github.com/standardnotes/api-gateway/issues/687)) ([19b8921](https://github.com/standardnotes/api-gateway/commit/19b8921f286ff8f88c427e8ddd4512a8d61edb4f))

## [1.69.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.69.2...@standardnotes/api-gateway@1.69.3) (2023-08-03)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.69.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.69.1...@standardnotes/api-gateway@1.69.2) (2023-08-02)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.69.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.69.0...@standardnotes/api-gateway@1.69.1) (2023-07-31)

### Bug Fixes

* **api-gateway:** remove duplicating req/res objects on return raw response from payments ([79d71ca](https://github.com/standardnotes/api-gateway/commit/79d71ca161cc18135fcd1a83b021662e189b3ddb))

# [1.69.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.68.1...@standardnotes/api-gateway@1.69.0) (2023-07-31)

### Features

* refactor deleting account ([#676](https://github.com/standardnotes/api-gateway/issues/676)) ([0d5dcdd](https://github.com/standardnotes/api-gateway/commit/0d5dcdd8ec2336e41e7604c4157f79a89163ed29))

## [1.68.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.68.0...@standardnotes/api-gateway@1.68.1) (2023-07-27)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.68.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.67.4...@standardnotes/api-gateway@1.68.0) (2023-07-27)

### Features

* **syncing-server:** add deleting outbound messages ([e8ba49e](https://github.com/standardnotes/api-gateway/commit/e8ba49ecca38ab10c0ea0e1f4cf4db9fb17366db))

## [1.67.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.67.3...@standardnotes/api-gateway@1.67.4) (2023-07-26)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.67.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.67.2...@standardnotes/api-gateway@1.67.3) (2023-07-26)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.67.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.67.1...@standardnotes/api-gateway@1.67.2) (2023-07-21)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.67.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.67.0...@standardnotes/api-gateway@1.67.1) (2023-07-21)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.67.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.66.1...@standardnotes/api-gateway@1.67.0) (2023-07-20)

### Features

* **syncing-server:** add shared vaults, invites, messages and notifications to sync response ([#665](https://github.com/standardnotes/api-gateway/issues/665)) ([efa4d7f](https://github.com/standardnotes/api-gateway/commit/efa4d7fc6007ef668e3de3b04853ac11b2d13c30))

## [1.66.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.66.0...@standardnotes/api-gateway@1.66.1) (2023-07-19)

### Bug Fixes

* add missing imports and exports for controllers ([#664](https://github.com/standardnotes/api-gateway/issues/664)) ([aee6e60](https://github.com/standardnotes/api-gateway/commit/aee6e6058359e2b5231cc13387656f837699300f))

# [1.66.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.65.7...@standardnotes/api-gateway@1.66.0) (2023-07-19)

### Features

* **syncing-server:** add persistence of shared vaults with users and invites + controllers ([#662](https://github.com/standardnotes/api-gateway/issues/662)) ([3f21a35](https://github.com/standardnotes/api-gateway/commit/3f21a358d24d70daf541aa62dc86cd9e29500e62))

## [1.65.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.65.6...@standardnotes/api-gateway@1.65.7) (2023-07-17)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.65.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.65.5...@standardnotes/api-gateway@1.65.6) (2023-07-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.65.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.65.4...@standardnotes/api-gateway@1.65.5) (2023-07-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.65.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.65.3...@standardnotes/api-gateway@1.65.4) (2023-07-06)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.65.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.65.2...@standardnotes/api-gateway@1.65.3) (2023-07-05)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.65.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.65.1...@standardnotes/api-gateway@1.65.2) (2023-06-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.65.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.65.0...@standardnotes/api-gateway@1.65.1) (2023-06-30)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.65.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.64.3...@standardnotes/api-gateway@1.65.0) (2023-06-30)

### Features

* shared vaults functionality in api-gateway,auth,files,common,security,domain-events. ([#629](https://github.com/standardnotes/api-gateway/issues/629)) ([fa7fbe2](https://github.com/standardnotes/api-gateway/commit/fa7fbe26e7b0707fc21d71e04af76870f5248baf))

## [1.64.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.64.2...@standardnotes/api-gateway@1.64.3) (2023-06-28)

### Bug Fixes

* add debug logs for invalid-auth responses ([d5a8409](https://github.com/standardnotes/api-gateway/commit/d5a8409bb5d35b9caf410a36ea0d5cb747129e8d))

## [1.64.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.64.1...@standardnotes/api-gateway@1.64.2) (2023-06-22)

### Bug Fixes

* **home-server:** add debug logs about container initalizations ([0df4715](https://github.com/standardnotes/api-gateway/commit/0df471585fd5b4626ec2972f3b9a3e33b2830e65))

## [1.64.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.64.0...@standardnotes/api-gateway@1.64.1) (2023-06-09)

### Bug Fixes

* **api-gateway:** direct call service proxy to return 400 responses instead of throwing errors ([e6a4cc3](https://github.com/standardnotes/api-gateway/commit/e6a4cc3098bdf84fc9d48ed0d9098ebb52afb0e7))

# [1.64.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.63.2...@standardnotes/api-gateway@1.64.0) (2023-06-05)

### Features

* **home-server:** allow running the home server with a mysql and redis configuration ([#622](https://github.com/standardnotes/api-gateway/issues/622)) ([d6e531d](https://github.com/standardnotes/api-gateway/commit/d6e531d4b6c1c80a894f6d7ec93632595268dd64))

## [1.63.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.63.1...@standardnotes/api-gateway@1.63.2) (2023-06-02)

### Bug Fixes

* **home-server:** streaming logs ([a8b806a](https://github.com/standardnotes/api-gateway/commit/a8b806af084b3e3fe8707ff0cb041a74042ee049))

## [1.63.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.63.0...@standardnotes/api-gateway@1.63.1) (2023-06-02)

### Bug Fixes

* **home-server:** add default for VERSION environment variable ([2f569d4](https://github.com/standardnotes/api-gateway/commit/2f569d41047a802eb72ef1a3618ffe4df28a709c))

# [1.63.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.62.4...@standardnotes/api-gateway@1.63.0) (2023-06-02)

### Features

* **home-server:** add overriding environment variables in underlying services ([#621](https://github.com/standardnotes/api-gateway/issues/621)) ([f0cbec0](https://github.com/standardnotes/api-gateway/commit/f0cbec07b87d60dfad92072944553f76e0bea164))

## [1.62.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.62.3...@standardnotes/api-gateway@1.62.4) (2023-06-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.62.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.62.2...@standardnotes/api-gateway@1.62.3) (2023-06-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.62.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.62.1...@standardnotes/api-gateway@1.62.2) (2023-06-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.62.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.62.0...@standardnotes/api-gateway@1.62.1) (2023-05-31)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.62.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.61.5...@standardnotes/api-gateway@1.62.0) (2023-05-31)

### Features

* **home-server:** add custom home server logs ([#619](https://github.com/standardnotes/api-gateway/issues/619)) ([bc63d0a](https://github.com/standardnotes/api-gateway/commit/bc63d0aeea86abbb4a144b2682b7070d7bdfe878))

## [1.61.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.61.4...@standardnotes/api-gateway@1.61.5) (2023-05-31)

### Reverts

* Revert "Revert "feat: make home server components publishable (#617)"" ([13c85d4](https://github.com/standardnotes/api-gateway/commit/13c85d43318caa0fb53726f13ea581ba4a5f816b)), closes [#617](https://github.com/standardnotes/api-gateway/issues/617)

## [1.61.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.61.3...@standardnotes/api-gateway@1.61.4) (2023-05-31)

### Bug Fixes

* **home-server:** make the package publishable ([56a312f](https://github.com/standardnotes/api-gateway/commit/56a312f21730b32b766c358a5ceb0865722bac46))

## [1.61.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.61.2...@standardnotes/api-gateway@1.61.3) (2023-05-30)

### Reverts

* Revert "feat: make home server components publishable (#617)" ([1a8daef](https://github.com/standardnotes/api-gateway/commit/1a8daef79d55a8cdee1632b294b897176af64b26)), closes [#617](https://github.com/standardnotes/api-gateway/issues/617)

## [1.61.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.61.0...@standardnotes/api-gateway@1.61.2) (2023-05-30)

### Bug Fixes

* bump version manually to publish packages ([b0d01df](https://github.com/standardnotes/api-gateway/commit/b0d01dffd91557c67eac2940d9270bca208c1128))

# [1.61.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.60.0...@standardnotes/api-gateway@1.61.0) (2023-05-30)

### Features

* make home server components publishable ([#617](https://github.com/standardnotes/api-gateway/issues/617)) ([55fd873](https://github.com/standardnotes/api-gateway/commit/55fd873b375e204dc9b0477b2cc6ed4582e5b603))

# [1.60.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.59.0...@standardnotes/api-gateway@1.60.0) (2023-05-30)

### Features

* upgrade to node 20.2.0 ([#616](https://github.com/standardnotes/api-gateway/issues/616)) ([a6b062f](https://github.com/standardnotes/api-gateway/commit/a6b062f638595537e1ece28bc79bded41d875e18))

# [1.59.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.58.0...@standardnotes/api-gateway@1.59.0) (2023-05-29)

### Features

* add files server as a service to home-server ([#614](https://github.com/standardnotes/api-gateway/issues/614)) ([c7d575a](https://github.com/standardnotes/api-gateway/commit/c7d575a0ffc7eb3e8799c3835da5727584f4f67b))

# [1.58.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.57.0...@standardnotes/api-gateway@1.58.0) (2023-05-25)

### Features

* add revisions service to home server ([#613](https://github.com/standardnotes/api-gateway/issues/613)) ([c70040f](https://github.com/standardnotes/api-gateway/commit/c70040fe5dfd35663b9811fbbaa9370bd0298482))

# [1.57.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.56.2...@standardnotes/api-gateway@1.57.0) (2023-05-25)

### Features

* refactor auth middleware to handle required and optional cross service token scenarios ([#612](https://github.com/standardnotes/api-gateway/issues/612)) ([1e4c7d0](https://github.com/standardnotes/api-gateway/commit/1e4c7d0f317d5c2d98065da12ffeb950b10ee5dc))

## [1.56.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.56.1...@standardnotes/api-gateway@1.56.2) (2023-05-18)

### Bug Fixes

* **api-gateway:** decorating responses for direct call proxy ([4ab32c6](https://github.com/standardnotes/api-gateway/commit/4ab32c670eedcfc64611a191bc25566d43372b23))
* **api-gateway:** pkce endpoints resolution for direct code calls ([c7e605f](https://github.com/standardnotes/api-gateway/commit/c7e605fd6046e8476c493658c6feaed365e82e5d))

## [1.56.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.56.0...@standardnotes/api-gateway@1.56.1) (2023-05-18)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.56.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.55.0...@standardnotes/api-gateway@1.56.0) (2023-05-17)

### Features

* bundle syncing server into home server setup ([#611](https://github.com/standardnotes/api-gateway/issues/611)) ([b3b617e](https://github.com/standardnotes/api-gateway/commit/b3b617ea0b4f4574f6aa7cfae0e9fa8f868f1f4c))

# [1.55.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.54.0...@standardnotes/api-gateway@1.55.0) (2023-05-17)

### Features

* add direct event handling for home server ([#608](https://github.com/standardnotes/api-gateway/issues/608)) ([8a47d81](https://github.com/standardnotes/api-gateway/commit/8a47d81936acd765224e74fd083810579a83c9a7))

# [1.54.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.53.1...@standardnotes/api-gateway@1.54.0) (2023-05-16)

### Features

* home-server package initial setup with Api Gateway and Auth services ([#605](https://github.com/standardnotes/api-gateway/issues/605)) ([dc71e67](https://github.com/standardnotes/api-gateway/commit/dc71e6777fc4c51234b79f6fb409f9f3111cc6a5))

## [1.53.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.53.0...@standardnotes/api-gateway@1.53.1) (2023-05-15)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.53.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.52.1...@standardnotes/api-gateway@1.53.0) (2023-05-09)

### Features

* **home-server:** add boilerplate ([#601](https://github.com/standardnotes/api-gateway/issues/601)) ([750cd26](https://github.com/standardnotes/api-gateway/commit/750cd26c369e7d93fa3da29dbe41823059252639))

## [1.52.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.52.0...@standardnotes/api-gateway@1.52.1) (2023-05-09)

### Bug Fixes

* node engine version requirement in package.json files ([62a0e89](https://github.com/standardnotes/api-gateway/commit/62a0e89748ab306566c4aa10b9dc0385fb0f1684))

# [1.52.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.51.0...@standardnotes/api-gateway@1.52.0) (2023-05-08)

### Features

* upgrade to node 20.1.0 ([#590](https://github.com/standardnotes/api-gateway/issues/590)) ([8fbb94d](https://github.com/standardnotes/api-gateway/commit/8fbb94d15ab664cca775ec71d51db465547c35ee))

# [1.51.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.50.2...@standardnotes/api-gateway@1.51.0) (2023-05-05)

### Features

* change payment method endpoint ([f5ac8ac](https://github.com/standardnotes/api-gateway/commit/f5ac8ac5e95eaaeff0cb034c8d6f7a233a352cda))

## [1.50.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.50.1...@standardnotes/api-gateway@1.50.2) (2023-05-05)

### Bug Fixes

* remove sentry ([c6122d3](https://github.com/standardnotes/api-gateway/commit/c6122d33b9ef493758eb2f40837ae0ab90554a67))
* remove unused imports ([990140c](https://github.com/standardnotes/api-gateway/commit/990140c3924456ba05d85ef535c953081b217e4b))

## [1.50.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.50.0...@standardnotes/api-gateway@1.50.1) (2023-05-04)

### Bug Fixes

* add env vars to control cache type for home server ([c8ea2ab](https://github.com/standardnotes/api-gateway/commit/c8ea2ab199bfd6d1836078fa26d578400a8099db))

# [1.50.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.13...@standardnotes/api-gateway@1.50.0) (2023-05-02)

### Features

* **api-gateway:** add in memory cache for home server ([#582](https://github.com/standardnotes/api-gateway/issues/582)) ([0900dc7](https://github.com/standardnotes/api-gateway/commit/0900dc75ace12d263336c15d30d06a386b35ff20))

## [1.49.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.12...@standardnotes/api-gateway@1.49.13) (2023-05-02)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.11...@standardnotes/api-gateway@1.49.12) (2023-04-27)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.10...@standardnotes/api-gateway@1.49.11) (2023-04-27)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.9...@standardnotes/api-gateway@1.49.10) (2023-04-21)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.8...@standardnotes/api-gateway@1.49.9) (2023-04-21)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.7...@standardnotes/api-gateway@1.49.8) (2023-03-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.6...@standardnotes/api-gateway@1.49.7) (2023-03-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.5...@standardnotes/api-gateway@1.49.6) (2023-03-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.4...@standardnotes/api-gateway@1.49.5) (2023-03-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.3...@standardnotes/api-gateway@1.49.4) (2023-02-25)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.2...@standardnotes/api-gateway@1.49.3) (2023-02-24)

### Bug Fixes

* **api-gateywa:** remove stale proxy references ([dfa5187](https://github.com/standardnotes/api-gateway/commit/dfa5187ff73833bf981d273da79f78ae0309a493))

## [1.49.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.1...@standardnotes/api-gateway@1.49.2) (2023-02-23)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.49.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.49.0...@standardnotes/api-gateway@1.49.1) (2023-02-23)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.49.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.48.3...@standardnotes/api-gateway@1.49.0) (2023-02-22)

### Bug Fixes

* **api-gateway:** proxy endpoint for request passing ([bc9182f](https://github.com/standardnotes/api-gateway/commit/bc9182f214c5386c5f1dd0bcbafbce34d413b6e8))

### Features

* **proxy:** add proxy server ([dfe30d7](https://github.com/standardnotes/api-gateway/commit/dfe30d7f5e8598ec1886db0e061b7d593cc27e29))

## [1.48.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.48.2...@standardnotes/api-gateway@1.48.3) (2023-02-21)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.48.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.48.1...@standardnotes/api-gateway@1.48.2) (2023-02-20)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.48.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.48.0...@standardnotes/api-gateway@1.48.1) (2023-02-15)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.48.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.47.1...@standardnotes/api-gateway@1.48.0) (2023-02-15)

### Features

* optimize memory usage ([#444](https://github.com/standardnotes/api-gateway/issues/444)) ([fdf4b29](https://github.com/standardnotes/api-gateway/commit/fdf4b29ae2717e9b5d1fba2722beb7621a7e5c37))

## [1.47.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.47.0...@standardnotes/api-gateway@1.47.1) (2023-02-14)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.47.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.13...@standardnotes/api-gateway@1.47.0) (2023-02-13)

### Features

* **syncing-server:** refactor container config into server and worker ([#443](https://github.com/standardnotes/api-gateway/issues/443)) ([993d311](https://github.com/standardnotes/api-gateway/commit/993d31167b8b0ac11e3df530d2d1ee566940df6e))

## [1.46.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.12...@standardnotes/api-gateway@1.46.13) (2023-02-09)

### Bug Fixes

* performance of startup sequence in supervisor controlled self-hosting setup ([5bbdc7e](https://github.com/standardnotes/api-gateway/commit/5bbdc7e426c436b17dc130e3c6d9163080561c76))

## [1.46.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.11...@standardnotes/api-gateway@1.46.12) (2023-02-09)

### Bug Fixes

* optimize memory usage ([e96fd6d](https://github.com/standardnotes/api-gateway/commit/e96fd6d69e1252842b5c91b1bedefa36e5d4a232))

## [1.46.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.10...@standardnotes/api-gateway@1.46.11) (2023-02-06)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.9...@standardnotes/api-gateway@1.46.10) (2023-01-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.8...@standardnotes/api-gateway@1.46.9) (2023-01-25)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.7...@standardnotes/api-gateway@1.46.8) (2023-01-25)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.6...@standardnotes/api-gateway@1.46.7) (2023-01-20)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.5...@standardnotes/api-gateway@1.46.6) (2023-01-20)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.4...@standardnotes/api-gateway@1.46.5) (2023-01-19)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.3...@standardnotes/api-gateway@1.46.4) (2023-01-19)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.2...@standardnotes/api-gateway@1.46.3) (2023-01-19)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.1...@standardnotes/api-gateway@1.46.2) (2023-01-19)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.46.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.46.0...@standardnotes/api-gateway@1.46.1) (2023-01-18)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.46.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.45.3...@standardnotes/api-gateway@1.46.0) (2023-01-16)

### Features

* **api-gateway:** add all revisions endpoints on v2 ([60b3dd6](https://github.com/standardnotes/api-gateway/commit/60b3dd6138ef9b8e9a717873548afc2d3924a0d7))
* **api-gateway:** switch to fetching revisions from reivsions server ([22c1f93](https://github.com/standardnotes/api-gateway/commit/22c1f936c3a770a82dc1a1e6aa136e183d308aa6))

## [1.45.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.45.2...@standardnotes/api-gateway@1.45.3) (2023-01-16)

### Bug Fixes

* **api-gateway:** add noindex robots meta tag to api gateway homepage ([04c6888](https://github.com/standardnotes/api-gateway/commit/04c6888cf65f9f1315fc2fb8af069d26bfbc31b1))

## [1.45.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.45.1...@standardnotes/api-gateway@1.45.2) (2023-01-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.45.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.45.0...@standardnotes/api-gateway@1.45.1) (2023-01-13)

### Bug Fixes

* add robots.txt setup for api-gateway and files server to disallow indexing ([bb82043](https://github.com/standardnotes/api-gateway/commit/bb820437af2b9644d7597de045b5840037b81db3))

# [1.45.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.44.0...@standardnotes/api-gateway@1.45.0) (2023-01-05)

### Features

* **auth:** add recovery sign in with recovery codes ([cac899a](https://github.com/standardnotes/api-gateway/commit/cac899a7e558d066895dfb3ba28418d94072f2b7))

# [1.44.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.43.0...@standardnotes/api-gateway@1.44.0) (2022-12-29)

### Features

* **auth:** add removing authenticator ([de50d76](https://github.com/standardnotes/api-gateway/commit/de50d76800a4240729763b2df11c4a1718951670))

# [1.43.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.42.0...@standardnotes/api-gateway@1.43.0) (2022-12-29)

### Features

* **auth:** add listing authenticators ([01837ea](https://github.com/standardnotes/api-gateway/commit/01837eaea9b1f219e7ad3be4d28cd0df099fe423))

# [1.42.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.41.3...@standardnotes/api-gateway@1.42.0) (2022-12-29)

### Features

* **auth:** add http endpoints for authenticators ([b6fda90](https://github.com/standardnotes/api-gateway/commit/b6fda901ef66a3e66541bd1e3f041b8268a1c3f5))

## [1.41.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.41.2...@standardnotes/api-gateway@1.41.3) (2022-12-28)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.41.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.41.1...@standardnotes/api-gateway@1.41.2) (2022-12-20)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.41.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.41.0...@standardnotes/api-gateway@1.41.1) (2022-12-19)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.41.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.40.2...@standardnotes/api-gateway@1.41.0) (2022-12-19)

### Features

* **auth:** add session traces ([8bcb552](https://github.com/standardnotes/api-gateway/commit/8bcb552783b2d12f3296b3195752168482790bc8))

## [1.40.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.40.1...@standardnotes/api-gateway@1.40.2) (2022-12-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.40.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.40.0...@standardnotes/api-gateway@1.40.1) (2022-12-12)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.40.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.24...@standardnotes/api-gateway@1.40.0) (2022-12-12)

### Features

* **api-gateway:** add unsubscribe from emails endpoint ([22d6a02](https://github.com/standardnotes/api-gateway/commit/22d6a02d049ba3bde890c7def91e19f013ba3e22))

## [1.39.24](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.23...@standardnotes/api-gateway@1.39.24) (2022-12-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.23](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.22...@standardnotes/api-gateway@1.39.23) (2022-12-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.22](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.21...@standardnotes/api-gateway@1.39.22) (2022-12-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.21](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.20...@standardnotes/api-gateway@1.39.21) (2022-12-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.20](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.19...@standardnotes/api-gateway@1.39.20) (2022-12-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.19](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.18...@standardnotes/api-gateway@1.39.19) (2022-12-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.18](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.17...@standardnotes/api-gateway@1.39.18) (2022-12-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.17](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.16...@standardnotes/api-gateway@1.39.17) (2022-12-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.16](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.15...@standardnotes/api-gateway@1.39.16) (2022-12-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.15](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.14...@standardnotes/api-gateway@1.39.15) (2022-12-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.14](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.13...@standardnotes/api-gateway@1.39.14) (2022-12-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.12...@standardnotes/api-gateway@1.39.13) (2022-12-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.11...@standardnotes/api-gateway@1.39.12) (2022-12-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.10...@standardnotes/api-gateway@1.39.11) (2022-12-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.9...@standardnotes/api-gateway@1.39.10) (2022-12-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.8...@standardnotes/api-gateway@1.39.9) (2022-12-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.7...@standardnotes/api-gateway@1.39.8) (2022-12-06)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.6...@standardnotes/api-gateway@1.39.7) (2022-12-05)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.5...@standardnotes/api-gateway@1.39.6) (2022-11-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.4...@standardnotes/api-gateway@1.39.5) (2022-11-28)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.3...@standardnotes/api-gateway@1.39.4) (2022-11-25)

### Bug Fixes

* **api-gateway:** make revisions and workspace server urls optional ([8907879](https://github.com/standardnotes/api-gateway/commit/8907879a194d2d8328fbd3ca8ec9d0b608c2da50))

## [1.39.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.2...@standardnotes/api-gateway@1.39.3) (2022-11-25)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.1...@standardnotes/api-gateway@1.39.2) (2022-11-24)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.39.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.39.0...@standardnotes/api-gateway@1.39.1) (2022-11-23)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.39.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.38.9...@standardnotes/api-gateway@1.39.0) (2022-11-22)

### Features

* **api-gateway:** add v2 revisions controller ([92ba759](https://github.com/standardnotes/api-gateway/commit/92ba759b1c3719e773f989707ddd6d7a9ec57d1c))

## [1.38.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.38.8...@standardnotes/api-gateway@1.38.9) (2022-11-22)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.38.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.38.7...@standardnotes/api-gateway@1.38.8) (2022-11-21)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.38.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.38.6...@standardnotes/api-gateway@1.38.7) (2022-11-18)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.38.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.38.5...@standardnotes/api-gateway@1.38.6) (2022-11-16)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.38.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.38.4...@standardnotes/api-gateway@1.38.5) (2022-11-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.38.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.38.1...@standardnotes/api-gateway@1.38.4) (2022-11-14)

### Bug Fixes

* **api-gateway:** bump version ([6f5e9b7](https://github.com/standardnotes/api-gateway/commit/6f5e9b7b5a83a9e8894f1dff5cfc91228d90b7b4))

## [1.38.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.38.0...@standardnotes/api-gateway@1.38.1) (2022-11-14)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.38.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.11...@standardnotes/api-gateway@1.38.0) (2022-11-13)

### Features

* iap confirm endpoint ([#338](https://github.com/standardnotes/api-gateway/issues/338)) ([3bba367](https://github.com/standardnotes/api-gateway/commit/3bba36742ac00c8756dd69f3a81ea124538d5cbe))

## [1.37.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.10...@standardnotes/api-gateway@1.37.11) (2022-11-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.9...@standardnotes/api-gateway@1.37.10) (2022-11-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.8...@standardnotes/api-gateway@1.37.9) (2022-11-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.7...@standardnotes/api-gateway@1.37.8) (2022-11-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.6...@standardnotes/api-gateway@1.37.7) (2022-11-10)

### Bug Fixes

* **api-gateway:** setting headers ([3c2ac05](https://github.com/standardnotes/api-gateway/commit/3c2ac05c606371305b76dd368d5fe9287045f380))

## [1.37.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.5...@standardnotes/api-gateway@1.37.6) (2022-11-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.4...@standardnotes/api-gateway@1.37.5) (2022-11-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.3...@standardnotes/api-gateway@1.37.4) (2022-11-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.2...@standardnotes/api-gateway@1.37.3) (2022-11-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.1...@standardnotes/api-gateway@1.37.2) (2022-11-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.37.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.37.0...@standardnotes/api-gateway@1.37.1) (2022-11-09)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.37.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.14...@standardnotes/api-gateway@1.37.0) (2022-11-07)

### Features

* remove analytics scope from other services in favor of a separate service ([ff1d5db](https://github.com/standardnotes/api-gateway/commit/ff1d5db12c93f8e51c07c3aecb9fed4be48ea96a))

## [1.36.14](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.13...@standardnotes/api-gateway@1.36.14) (2022-11-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.12...@standardnotes/api-gateway@1.36.13) (2022-11-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.11...@standardnotes/api-gateway@1.36.12) (2022-11-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.10...@standardnotes/api-gateway@1.36.11) (2022-11-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.9...@standardnotes/api-gateway@1.36.10) (2022-11-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.8...@standardnotes/api-gateway@1.36.9) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.7...@standardnotes/api-gateway@1.36.8) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.6...@standardnotes/api-gateway@1.36.7) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.5...@standardnotes/api-gateway@1.36.6) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.4...@standardnotes/api-gateway@1.36.5) (2022-11-04)

### Bug Fixes

* **api-gateway:** removing sns bindings ([b4c5b5a](https://github.com/standardnotes/api-gateway/commit/b4c5b5a84e4c619f175620b141279dfa8e2e6754))

## [1.36.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.3...@standardnotes/api-gateway@1.36.4) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.2...@standardnotes/api-gateway@1.36.3) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.1...@standardnotes/api-gateway@1.36.2) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.36.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.36.0...@standardnotes/api-gateway@1.36.1) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.36.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.35.1...@standardnotes/api-gateway@1.36.0) (2022-11-04)

### Features

* **analytics:** move the analytics report from api-gateway to analytics ([34e11fd](https://github.com/standardnotes/api-gateway/commit/34e11fd5b0ef09a056c90127065c9dfae3e0172a))

## [1.35.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.35.0...@standardnotes/api-gateway@1.35.1) (2022-11-04)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.35.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.34.1...@standardnotes/api-gateway@1.35.0) (2022-11-03)

### Features

* **auth:** add analytics for subscription reactivating ([460d6a8](https://github.com/standardnotes/api-gateway/commit/460d6a8d0f17eee624feb5d2588086ae6f0996e4))

## [1.34.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.34.0...@standardnotes/api-gateway@1.34.1) (2022-11-03)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.34.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.33.6...@standardnotes/api-gateway@1.34.0) (2022-11-02)

### Features

* **auth:** add processing user requests ([2255f85](https://github.com/standardnotes/api-gateway/commit/2255f856f928e855ac94f8aca4e1fb81047f58f7))

## [1.33.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.33.5...@standardnotes/api-gateway@1.33.6) (2022-11-02)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.33.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.33.4...@standardnotes/api-gateway@1.33.5) (2022-11-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.33.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.33.3...@standardnotes/api-gateway@1.33.4) (2022-10-31)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.33.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.33.2...@standardnotes/api-gateway@1.33.3) (2022-10-31)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.33.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.33.1...@standardnotes/api-gateway@1.33.2) (2022-10-26)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.33.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.33.0...@standardnotes/api-gateway@1.33.1) (2022-10-24)

### Bug Fixes

* **api-gateway:** remove invite declining endpoint ([23b05ca](https://github.com/standardnotes/api-gateway/commit/23b05caea2197e36fa446ffb3c9a5e7598224f3e))

# [1.33.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.32.0...@standardnotes/api-gateway@1.33.0) (2022-10-24)

### Features

* **auth:** change accepting invitations to be an authorized endpoint ([771a555](https://github.com/standardnotes/api-gateway/commit/771a555b4f33452311cd5bf0b8cfcbc4f2f1c4dd))

# [1.32.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.31.2...@standardnotes/api-gateway@1.32.0) (2022-10-19)

### Features

* building server applications in ARM64 architecture for Docker ([fd92866](https://github.com/standardnotes/api-gateway/commit/fd92866ba1a86b22769b23cc4c8387a83f87979a))

## [1.31.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.31.1...@standardnotes/api-gateway@1.31.2) (2022-10-13)

### Bug Fixes

* **api-gateway:** make web sockets url optional ([219b1ba](https://github.com/standardnotes/api-gateway/commit/219b1baa41f24ba140f24f48bf9c9d7e01288ed5))

## [1.31.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.31.0...@standardnotes/api-gateway@1.31.1) (2022-10-13)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.31.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.30.1...@standardnotes/api-gateway@1.31.0) (2022-10-13)

### Features

* **auth:** remove websocket handling in favor of websockets service ([86ae4a5](https://github.com/standardnotes/api-gateway/commit/86ae4a59a3ac7915ad96ed5176b545f4d005e837))

## [1.30.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.30.0...@standardnotes/api-gateway@1.30.1) (2022-10-13)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.30.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.29.0...@standardnotes/api-gateway@1.30.0) (2022-10-12)

### Features

* **workspace:** add endpoints for initiating keyshare in a workspace ([0c1a779](https://github.com/standardnotes/api-gateway/commit/0c1a779ef03819928e7e791a6843d90eb9fed964))

# [1.29.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.28.2...@standardnotes/api-gateway@1.29.0) (2022-10-11)

### Features

* add listin worspaces and workspace users ([095d13f](https://github.com/standardnotes/api-gateway/commit/095d13f8bbfe543fcf086840e1a985447a6c51ef))

## [1.28.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.28.1...@standardnotes/api-gateway@1.28.2) (2022-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.28.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.28.0...@standardnotes/api-gateway@1.28.1) (2022-10-11)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.28.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.27.4...@standardnotes/api-gateway@1.28.0) (2022-10-11)

### Features

* **workspace:** add invite to workspace endpoints ([266adda](https://github.com/standardnotes/api-gateway/commit/266adda45bd3ad84bc6605824b6be1dd912f3f9a))

## [1.27.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.27.3...@standardnotes/api-gateway@1.27.4) (2022-10-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.27.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.27.2...@standardnotes/api-gateway@1.27.3) (2022-10-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.27.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.27.1...@standardnotes/api-gateway@1.27.2) (2022-10-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.27.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.27.0...@standardnotes/api-gateway@1.27.1) (2022-10-10)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.27.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.26.2...@standardnotes/api-gateway@1.27.0) (2022-10-07)

### Features

* add workspaces creation ([156ab65](https://github.com/standardnotes/api-gateway/commit/156ab6527265351b13797394cbd34da037ab5a38))

## [1.26.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.26.1...@standardnotes/api-gateway@1.26.2) (2022-10-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.26.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.26.0...@standardnotes/api-gateway@1.26.1) (2022-10-06)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.26.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.25.0...@standardnotes/api-gateway@1.26.0) (2022-10-05)

### Features

* **api-gateway:** include increments count in statistics measures report ([84e8a5c](https://github.com/standardnotes/api-gateway/commit/84e8a5cc6e6ba216f1c0737a7a93aba581eced0f))

# [1.25.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.24.5...@standardnotes/api-gateway@1.25.0) (2022-10-05)

### Features

* **api-gateway:** add detailed payments statistics to report ([7429f5c](https://github.com/standardnotes/api-gateway/commit/7429f5c8e9dafdba557cdbfb3d9020513fc7a9ee))

## [1.24.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.24.4...@standardnotes/api-gateway@1.24.5) (2022-10-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.24.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.24.3...@standardnotes/api-gateway@1.24.4) (2022-10-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.24.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.24.2...@standardnotes/api-gateway@1.24.3) (2022-10-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.24.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.24.1...@standardnotes/api-gateway@1.24.2) (2022-10-03)

### Bug Fixes

* **api-gateway:** report churn values for empty months ([f43fbf1](https://github.com/standardnotes/api-gateway/commit/f43fbf15844be05add905134dfb3e8ca90f78458))

## [1.24.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.24.0...@standardnotes/api-gateway@1.24.1) (2022-10-03)

### Bug Fixes

* add debug logs for churn calculation ([2236cc3](https://github.com/standardnotes/api-gateway/commit/2236cc3828167e4b94defbde2691bba38458bd1c))

# [1.24.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.23.0...@standardnotes/api-gateway@1.24.0) (2022-10-03)

### Features

* add calculating monthly churn rate ([f075cd8](https://github.com/standardnotes/api-gateway/commit/f075cd8c4dfc411ba513dfec21bb84c03b238254))

# [1.23.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.22.6...@standardnotes/api-gateway@1.23.0) (2022-09-30)

### Features

* **api-gateway:** add churn metrics to the report ([dfab849](https://github.com/standardnotes/api-gateway/commit/dfab849f48ab782c3cd2e97f52fdb72b7143002f))

## [1.22.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.22.5...@standardnotes/api-gateway@1.22.6) (2022-09-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.22.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.22.4...@standardnotes/api-gateway@1.22.5) (2022-09-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.22.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.22.3...@standardnotes/api-gateway@1.22.4) (2022-09-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.22.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.22.2...@standardnotes/api-gateway@1.22.3) (2022-09-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.22.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.22.1...@standardnotes/api-gateway@1.22.2) (2022-09-28)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.22.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.22.0...@standardnotes/api-gateway@1.22.1) (2022-09-27)

### Bug Fixes

* **api-gateway:** remove admin graphql endpoint from being publicly available ([0a90d98](https://github.com/standardnotes/api-gateway/commit/0a90d98c71c6023b700f852c91aedfe1ad23af55))

# [1.22.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.21.1...@standardnotes/api-gateway@1.22.0) (2022-09-22)

### Features

* **auth:** remove muting emails by use case in favor of updating user settings ([d3f36c0](https://github.com/standardnotes/api-gateway/commit/d3f36c05dfc114098a6c231d81149ebd1a959b74))

## [1.21.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.21.0...@standardnotes/api-gateway@1.21.1) (2022-09-21)

### Bug Fixes

* **api-gateway:** web socket connection routing ([d35de38](https://github.com/standardnotes/api-gateway/commit/d35de38289e70d707d57a859b8bf39833fa825dd))

# [1.21.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.20.0...@standardnotes/api-gateway@1.21.0) (2022-09-21)

### Features

* **auth:** add creating cross service token in exchange for web socket connection token ([965ae79](https://github.com/standardnotes/api-gateway/commit/965ae79414e25d0959f67e16dcbb054229013e1c))

# [1.20.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.19.6...@standardnotes/api-gateway@1.20.0) (2022-09-21)

### Features

* **auth:** add creating web socket connection tokens ([8033177](https://github.com/standardnotes/api-gateway/commit/8033177f48dc961194f24fb7daa1073b8b697b74))

## [1.19.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.19.5...@standardnotes/api-gateway@1.19.6) (2022-09-19)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.19.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.19.4...@standardnotes/api-gateway@1.19.5) (2022-09-16)

### Bug Fixes

* **auth:** change remaining subscription time stats to percentage ([5eb957c](https://github.com/standardnotes/api-gateway/commit/5eb957c82a8cc5fdcb6815e2cd30e49cd2b1e8ac))

## [1.19.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.19.3...@standardnotes/api-gateway@1.19.4) (2022-09-16)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.19.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.19.2...@standardnotes/api-gateway@1.19.3) (2022-09-15)

### Bug Fixes

* **api-gateway:** add remaining subscription time to stats ([89334c9](https://github.com/standardnotes/api-gateway/commit/89334c90221045308d83fce9e97c146185d21389))

## [1.19.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.19.1...@standardnotes/api-gateway@1.19.2) (2022-09-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.19.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.19.0...@standardnotes/api-gateway@1.19.1) (2022-09-09)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.19.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.18.0...@standardnotes/api-gateway@1.19.0) (2022-09-09)

### Features

* **syncing-server:** add tracking files count in stats ([52cc646](https://github.com/standardnotes/api-gateway/commit/52cc6462a66dae3bd6c05f551d4ba661c8a9b8c8))

# [1.18.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.17.4...@standardnotes/api-gateway@1.18.0) (2022-09-09)

### Bug Fixes

* **api-gateway:** add general activity breakdown to yesterdays report stats ([339c86f](https://github.com/standardnotes/api-gateway/commit/339c86fca073b02054260417b7519c08874e1e4e))

### Features

* **api-gateway:** add tracking general activity for free and paid users breakdown ([0afd3de](https://github.com/standardnotes/api-gateway/commit/0afd3de9779e2abe10deede24626a3cbe6b15e6c))

## [1.17.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.17.3...@standardnotes/api-gateway@1.17.4) (2022-09-09)

### Bug Fixes

* **api-gateway:** add notes count statistics to report ([ced852d](https://github.com/standardnotes/api-gateway/commit/ced852d9dbf8cab4c235b94a834968a5fc5e7d36))

## [1.17.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.17.2...@standardnotes/api-gateway@1.17.3) (2022-09-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.17.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.17.1...@standardnotes/api-gateway@1.17.2) (2022-09-08)

### Bug Fixes

* **api-gateway:** retention data structure to include both period keys ([50ddb91](https://github.com/standardnotes/api-gateway/commit/50ddb918ccc52bee4caad82504cb899bc5936150))

## [1.17.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.17.0...@standardnotes/api-gateway@1.17.1) (2022-09-08)

### Bug Fixes

* **api-gateway:** retention data structure ([47be084](https://github.com/standardnotes/api-gateway/commit/47be0841fc6d5fa00892e775bb3a40f404a6382b))

# [1.17.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.8...@standardnotes/api-gateway@1.17.0) (2022-09-08)

### Features

* **api-gateway:** add registration-to-activity retention analytics to report ([f139bb0](https://github.com/standardnotes/api-gateway/commit/f139bb003669bb41f98ad4bb59a036c489f43606))

## [1.16.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.7...@standardnotes/api-gateway@1.16.8) (2022-09-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.16.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.6...@standardnotes/api-gateway@1.16.7) (2022-09-08)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.16.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.5...@standardnotes/api-gateway@1.16.6) (2022-09-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.16.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.4...@standardnotes/api-gateway@1.16.5) (2022-09-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.16.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.3...@standardnotes/api-gateway@1.16.4) (2022-09-07)

### Bug Fixes

* **api-gateway:** add registration-to-subscription time to analytics report ([936591d](https://github.com/standardnotes/api-gateway/commit/936591d40b5f5beb5c0a824c92cdfa20fff51c97))

## [1.16.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.2...@standardnotes/api-gateway@1.16.3) (2022-09-07)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.16.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.1...@standardnotes/api-gateway@1.16.2) (2022-09-06)

### Bug Fixes

* **api-gateway:** include period key in statistics measures ([d149f46](https://github.com/standardnotes/api-gateway/commit/d149f46cf6456201dd8690977f64ed32a75f3459))
* **api-gateway:** period types on analytics report ([f94c8fc](https://github.com/standardnotes/api-gateway/commit/f94c8fc26e684a07101cc5282ebb9cda3c8c6961))

## [1.16.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.16.0...@standardnotes/api-gateway@1.16.1) (2022-09-06)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.16.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.12...@standardnotes/api-gateway@1.16.0) (2022-09-06)

### Features

* **api-gateway:** add statistics measures to report generation ([8151bb1](https://github.com/standardnotes/api-gateway/commit/8151bb108affb2b5cfa1ab365f99a9f0170a7795))

## [1.15.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.11...@standardnotes/api-gateway@1.15.12) (2022-09-06)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.10...@standardnotes/api-gateway@1.15.11) (2022-09-06)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.9...@standardnotes/api-gateway@1.15.10) (2022-09-05)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.8...@standardnotes/api-gateway@1.15.9) (2022-09-05)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.7...@standardnotes/api-gateway@1.15.8) (2022-09-05)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.6...@standardnotes/api-gateway@1.15.7) (2022-09-05)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.5...@standardnotes/api-gateway@1.15.6) (2022-09-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.4...@standardnotes/api-gateway@1.15.5) (2022-09-01)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.3...@standardnotes/api-gateway@1.15.4) (2022-08-30)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.15.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.2...@standardnotes/api-gateway@1.15.3) (2022-08-22)

### Bug Fixes

* **api-gateway:** add error logs on missing connection id for websockets ([f7def38](https://github.com/standardnotes/api-gateway/commit/f7def38e20f87ae24ebc736a41bc7cac53b0c61f))

## [1.15.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.1...@standardnotes/api-gateway@1.15.2) (2022-08-15)

### Bug Fixes

* **api-gateway:** add payment success events to report ([ee79347](https://github.com/standardnotes/api-gateway/commit/ee79347e27f5887def2cda57091a7c0a40570d33))

## [1.15.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.15.0...@standardnotes/api-gateway@1.15.1) (2022-08-15)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.15.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.14.3...@standardnotes/api-gateway@1.15.0) (2022-08-15)

### Features

* **api-gateway:** add gathering analytics for failed payments ([d0023a6](https://github.com/standardnotes/api-gateway/commit/d0023a6c92756c81b8daa9089d38141b6cd4fe48))

## [1.14.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.14.2...@standardnotes/api-gateway@1.14.3) (2022-08-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.14.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.14.1...@standardnotes/api-gateway@1.14.2) (2022-08-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.14.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.14.0...@standardnotes/api-gateway@1.14.1) (2022-08-15)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.14.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.13.1...@standardnotes/api-gateway@1.14.0) (2022-08-15)

### Features

* **api-gateway:** add quarterly analytics ([67378e4](https://github.com/standardnotes/api-gateway/commit/67378e4535ef2760cfe3fe27256ffe117ee11a71))

## [1.13.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.13.0...@standardnotes/api-gateway@1.13.1) (2022-08-15)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.13.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.12.0...@standardnotes/api-gateway@1.13.0) (2022-08-11)

### Features

* add analytics for subscription cancelling, refunding and account deletion ([1607638](https://github.com/standardnotes/api-gateway/commit/16076382bae74552a35901bb5474e2c2c2d96f43))

# [1.12.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.11.5...@standardnotes/api-gateway@1.12.0) (2022-08-10)

### Features

* **api-gateway:** add publishing subscription purchased, renewed and registration analytics ([dea5fd7](https://github.com/standardnotes/api-gateway/commit/dea5fd717d222d96bcbbd16a8d84a84ed20144a8))

## [1.11.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.11.4...@standardnotes/api-gateway@1.11.5) (2022-08-10)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.11.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.11.3...@standardnotes/api-gateway@1.11.4) (2022-08-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.11.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.11.2...@standardnotes/api-gateway@1.11.3) (2022-08-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.11.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.11.1...@standardnotes/api-gateway@1.11.2) (2022-08-09)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.11.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.11.0...@standardnotes/api-gateway@1.11.1) (2022-08-09)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.11.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.10.0...@standardnotes/api-gateway@1.11.0) (2022-08-09)

### Features

* add total count of analytics over time ([0b9524e](https://github.com/standardnotes/api-gateway/commit/0b9524eb26c39aabe8ad0f9cdbb3aaca63a65b0e))

# [1.10.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.9.1...@standardnotes/api-gateway@1.10.0) (2022-08-09)

### Features

* **api-gateway:** add editing items count over time ([b9225cd](https://github.com/standardnotes/api-gateway/commit/b9225cd9b6496301da2d8edc44c2a9861e03406b))

## [1.9.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.9.0...@standardnotes/api-gateway@1.9.1) (2022-08-08)

### Bug Fixes

* **api-gateway:** add general activity to calculating activity retention ([12e3a76](https://github.com/standardnotes/api-gateway/commit/12e3a768dd365198340ab4e2cd463e9392344e38))

# [1.9.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.8.0...@standardnotes/api-gateway@1.9.0) (2022-08-08)

### Features

* **api-gateway:** add analytics over time to daily report event ([845f08b](https://github.com/standardnotes/api-gateway/commit/845f08b060beda5dea69e16fbda132150de7d5f2))

# [1.8.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.7.4...@standardnotes/api-gateway@1.8.0) (2022-08-08)

### Features

* **api-gateway:** add marking server interaction as general activity in analytics ([a36764f](https://github.com/standardnotes/api-gateway/commit/a36764f1b058bed014b815fa2818370849053b18))

## [1.7.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.7.3...@standardnotes/api-gateway@1.7.4) (2022-07-29)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.7.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.7.2...@standardnotes/api-gateway@1.7.3) (2022-07-29)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.7.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.7.1...@standardnotes/api-gateway@1.7.2) (2022-07-27)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.7.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.7.0...@standardnotes/api-gateway@1.7.1) (2022-07-27)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.7.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.30...@standardnotes/api-gateway@1.7.0) (2022-07-26)

### Features

* **api-gateway:** add limited discount offer purchased to analytics report ([d203ce1](https://github.com/standardnotes/api-gateway/commit/d203ce188af4f775e01bc1752d4c6d84fc5f1675))

## [1.6.30](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.29...@standardnotes/api-gateway@1.6.30) (2022-07-26)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.29](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.28...@standardnotes/api-gateway@1.6.29) (2022-07-25)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.28](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.27...@standardnotes/api-gateway@1.6.28) (2022-07-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.27](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.26...@standardnotes/api-gateway@1.6.27) (2022-07-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.26](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.25...@standardnotes/api-gateway@1.6.26) (2022-07-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.25](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.24...@standardnotes/api-gateway@1.6.25) (2022-07-15)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.24](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.23...@standardnotes/api-gateway@1.6.24) (2022-07-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.23](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.22...@standardnotes/api-gateway@1.6.23) (2022-07-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.22](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.21...@standardnotes/api-gateway@1.6.22) (2022-07-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.21](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.20...@standardnotes/api-gateway@1.6.21) (2022-07-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.20](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.19...@standardnotes/api-gateway@1.6.20) (2022-07-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.19](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.18...@standardnotes/api-gateway@1.6.19) (2022-07-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.18](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.17...@standardnotes/api-gateway@1.6.18) (2022-07-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.17](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.16...@standardnotes/api-gateway@1.6.17) (2022-07-14)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.16](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.15...@standardnotes/api-gateway@1.6.16) (2022-07-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.15](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.14...@standardnotes/api-gateway@1.6.15) (2022-07-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.14](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.13...@standardnotes/api-gateway@1.6.14) (2022-07-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.13](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.12...@standardnotes/api-gateway@1.6.13) (2022-07-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.12](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.11...@standardnotes/api-gateway@1.6.12) (2022-07-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.11](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.10...@standardnotes/api-gateway@1.6.11) (2022-07-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.10](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.9...@standardnotes/api-gateway@1.6.10) (2022-07-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.9](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.8...@standardnotes/api-gateway@1.6.9) (2022-07-13)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.8](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.7...@standardnotes/api-gateway@1.6.8) (2022-07-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.7](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.6...@standardnotes/api-gateway@1.6.7) (2022-07-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.5...@standardnotes/api-gateway@1.6.6) (2022-07-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.4...@standardnotes/api-gateway@1.6.5) (2022-07-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.3...@standardnotes/api-gateway@1.6.4) (2022-07-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.2...@standardnotes/api-gateway@1.6.3) (2022-07-12)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.1...@standardnotes/api-gateway@1.6.2) (2022-07-11)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.6.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.6.0...@standardnotes/api-gateway@1.6.1) (2022-07-06)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.6.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.5.0...@standardnotes/api-gateway@1.6.0) (2022-07-06)

### Features

* add time package ([565e890](https://github.com/standardnotes/api-gateway/commit/565e890973b1d96544bb750fdd700d58f8dad088))

# [1.5.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.4.2...@standardnotes/api-gateway@1.5.0) (2022-07-06)

### Bug Fixes

* deps to @standarnotes/security ([699164e](https://github.com/standardnotes/api-gateway/commit/699164eba553cd07fb50f7a06ae8991028167603))

### Features

* add security package ([d86928f](https://github.com/standardnotes/api-gateway/commit/d86928f1b4b5feda8c330ed8ee0bf9de0fc12ae7))

## [1.4.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.4.1...@standardnotes/api-gateway@1.4.2) (2022-07-06)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.4.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.4.0...@standardnotes/api-gateway@1.4.1) (2022-07-06)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.4.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.3.5...@standardnotes/api-gateway@1.4.0) (2022-07-06)

### Features

* add analytics package ([14e4ca7](https://github.com/standardnotes/api-gateway/commit/14e4ca70b438dd3eaaa404bc0ca31d22a62b45be))

## [1.3.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.3.4...@standardnotes/api-gateway@1.3.5) (2022-07-06)

### Bug Fixes

* testing project packages ([d818799](https://github.com/standardnotes/api-gateway/commit/d818799418d3681c60ba1758b9d5dda945aed5a7))

## [1.3.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.3.3...@standardnotes/api-gateway@1.3.4) (2022-07-06)

### Bug Fixes

* publishing setup ([caaad92](https://github.com/standardnotes/api-gateway/commit/caaad9205cbf5e7fcec8d703d6257c3e616133e4))

## [1.3.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.3.2...@standardnotes/api-gateway@1.3.3) (2022-07-04)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.3.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.3.1...@standardnotes/api-gateway@1.3.2) (2022-06-28)

### Bug Fixes

* checking for html content-type ([4a430b2](https://github.com/standardnotes/api-gateway/commit/4a430b2701733358d14da64a5eaa4e03620033e0))

## [1.3.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.3.0...@standardnotes/api-gateway@1.3.1) (2022-06-28)

### Bug Fixes

* add origin meta property to daily analytics event ([376a59c](https://github.com/standardnotes/api-gateway/commit/376a59c1827411164a536157fc591a15e0a5b0b2))

# [1.3.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.2.2...@standardnotes/api-gateway@1.3.0) (2022-06-28)

### Features

* remove api metadata decorating html responses ([3035cbc](https://github.com/standardnotes/api-gateway/commit/3035cbc5ded1408bc4b8646563c4992ba5f27c75))

## [1.2.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.2.1...@standardnotes/api-gateway@1.2.2) (2022-06-27)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.2.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.2.0...@standardnotes/api-gateway@1.2.1) (2022-06-27)

### Bug Fixes

* issue with NaN error code responses ([2cb470b](https://github.com/standardnotes/api-gateway/commit/2cb470b99edc2fac8d5c38e4eb16201e55fe8753))

# [1.2.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.6...@standardnotes/api-gateway@1.2.0) (2022-06-27)

### Features

* add endpoint to mute marketing emails ([fa2a8da](https://github.com/standardnotes/api-gateway/commit/fa2a8da17bc6588021172adbbc4ecae5bd35f33a))

## [1.1.6](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.5...@standardnotes/api-gateway@1.1.6) (2022-06-27)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.1.5](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.4...@standardnotes/api-gateway@1.1.5) (2022-06-27)

### Bug Fixes

* upgrade sentry node sdk ([b6db194](https://github.com/standardnotes/api-gateway/commit/b6db194a22ff1d0afe96c291d545b408c0a5c373))

## [1.1.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.3...@standardnotes/api-gateway@1.1.4) (2022-06-24)

### Bug Fixes

* newrelic deps and setup db and cache for local development purposes ([ff09ae0](https://github.com/standardnotes/api-gateway/commit/ff09ae0a47747eaf7977ce5d3937ad385101eaeb))

## [1.1.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.2...@standardnotes/api-gateway@1.1.3) (2022-06-23)

### Bug Fixes

* curl in the final image ([0d67c55](https://github.com/standardnotes/api-gateway/commit/0d67c55e124eed08bca16824750152b895fceca7))

## [1.1.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.1...@standardnotes/api-gateway@1.1.2) (2022-06-23)

**Note:** Version bump only for package @standardnotes/api-gateway

## [1.1.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.0...@standardnotes/api-gateway@1.1.1) (2022-06-23)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.1.0](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.0-alpha.4...@standardnotes/api-gateway@1.1.0) (2022-06-23)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.1.0-alpha.4](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.0-alpha.3...@standardnotes/api-gateway@1.1.0-alpha.4) (2022-06-23)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.1.0-alpha.3](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.0-alpha.2...@standardnotes/api-gateway@1.1.0-alpha.3) (2022-06-23)

**Note:** Version bump only for package @standardnotes/api-gateway

# [1.1.0-alpha.2](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.0-alpha.1...@standardnotes/api-gateway@1.1.0-alpha.2) (2022-06-23)

### Bug Fixes

* add missing curl to docker image for healthcheck purposes ([7efb48d](https://github.com/standardnotes/api-gateway/commit/7efb48dd2a6066c29601d34bfcbfe6231f644c50))

# [1.1.0-alpha.1](https://github.com/standardnotes/api-gateway/compare/@standardnotes/api-gateway@1.1.0-alpha.0...@standardnotes/api-gateway@1.1.0-alpha.1) (2022-06-23)

**Note:** Version bump only for package @standardnotes/api-gateway

# 1.1.0-alpha.0 (2022-06-23)

### Features

* add api-gateway package ([57c3b9c](https://github.com/standardnotes/api-gateway/commit/57c3b9c29e5b16449c864e59dbc1fd11689125f9))
