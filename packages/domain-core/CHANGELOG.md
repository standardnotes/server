# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.24.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.24.1...@standardnotes/domain-core@1.24.2) (2023-08-02)

### Bug Fixes

* **domain-core:** remove unused content types ([71624f1](https://github.com/standardnotes/server/commit/71624f18979ed9254fafeeced733e598cd66cbeb))

## [1.24.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.24.0...@standardnotes/domain-core@1.24.1) (2023-07-27)

### Bug Fixes

* setting env vars on home server in e2e environment ([f87036e](https://github.com/standardnotes/server/commit/f87036e3a8dc6b7784e74e5f32ffd220033724f5))

# [1.24.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.23.4...@standardnotes/domain-core@1.24.0) (2023-07-26)

### Features

* extract shared vault user permission to domain-core ([e215ac4](https://github.com/standardnotes/server/commit/e215ac4343e9f8818f40004d31390d6ac23e369d))

## [1.23.4](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.23.3...@standardnotes/domain-core@1.23.4) (2023-07-26)

### Bug Fixes

* **syncing-server:** persisting aggregate changes from root ([#674](https://github.com/standardnotes/server/issues/674)) ([c34f548](https://github.com/standardnotes/server/commit/c34f548e45bbd8defb8d490936e90755fd284e78))

## [1.23.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.23.2...@standardnotes/domain-core@1.23.3) (2023-07-21)

### Bug Fixes

* **domain-core:** notification payload creation from string ([1708c3f](https://github.com/standardnotes/server/commit/1708c3f8a00897369585e1ef8022950a7c3c610e))

## [1.23.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.23.1...@standardnotes/domain-core@1.23.2) (2023-07-21)

### Bug Fixes

* user notifications structure ([#667](https://github.com/standardnotes/server/issues/667)) ([1bbb639](https://github.com/standardnotes/server/commit/1bbb639c83922ec09e3778f85419d76669d36ae3))

## [1.23.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.23.0...@standardnotes/domain-core@1.23.1) (2023-07-19)

### Bug Fixes

* **syncing-server:** add missing messages and key system identifier sql representations ([#663](https://github.com/standardnotes/server/issues/663)) ([d026152](https://github.com/standardnotes/server/commit/d026152ac8cb2ecda2eee8d3f7385d655b210938))

# [1.23.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.22.0...@standardnotes/domain-core@1.23.0) (2023-07-17)

### Features

* **syncing-server:** refactor syncing to decouple getting and saving items ([#659](https://github.com/standardnotes/server/issues/659)) ([cb74b23](https://github.com/standardnotes/server/commit/cb74b23e45b207136e299ce8a3db2c04dc87e21e))

# [1.22.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.21.1...@standardnotes/domain-core@1.22.0) (2023-07-12)

### Features

* domain items ([#655](https://github.com/standardnotes/server/issues/655)) ([a0af8f0](https://github.com/standardnotes/server/commit/a0af8f00252e1219e58cb7e066c11a8e71692e9d))

## [1.21.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.21.0...@standardnotes/domain-core@1.21.1) (2023-07-07)

### Bug Fixes

* transfer notifications from auth to syncing-server. ([#648](https://github.com/standardnotes/server/issues/648)) ([c288e5d](https://github.com/standardnotes/server/commit/c288e5d8dc54778a96a9fc33e3c9cae00583fade))

# [1.21.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.20.0...@standardnotes/domain-core@1.21.0) (2023-07-06)

### Features

* getting shared vault users and removing shared vault user ([#642](https://github.com/standardnotes/server/issues/642)) ([e905128](https://github.com/standardnotes/server/commit/e905128d45eaadb34d3465d4480dfb3a2c5f3f79))

# [1.20.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.19.0...@standardnotes/domain-core@1.20.0) (2023-07-05)

### Features

* deleting shared vaults. ([#640](https://github.com/standardnotes/server/issues/640)) ([f3161c2](https://github.com/standardnotes/server/commit/f3161c271296159331639814b2dbb2e566cc54c9))

# [1.19.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.18.0...@standardnotes/domain-core@1.19.0) (2023-06-30)

### Features

* add shared vaults model. ([#631](https://github.com/standardnotes/server/issues/631)) ([38e77f0](https://github.com/standardnotes/server/commit/38e77f04be441b7506c3390fb0d9894b34119c3e))

# [1.18.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.17.0...@standardnotes/domain-core@1.18.0) (2023-06-02)

### Features

* **home-server:** add overriding environment variables in underlying services ([#621](https://github.com/standardnotes/server/issues/621)) ([f0cbec0](https://github.com/standardnotes/server/commit/f0cbec07b87d60dfad92072944553f76e0bea164))

# [1.17.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.16.2...@standardnotes/domain-core@1.17.0) (2023-05-31)

### Features

* **home-server:** add custom home server logs ([#619](https://github.com/standardnotes/server/issues/619)) ([bc63d0a](https://github.com/standardnotes/server/commit/bc63d0aeea86abbb4a144b2682b7070d7bdfe878))

## [1.16.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.16.0...@standardnotes/domain-core@1.16.2) (2023-05-30)

### Bug Fixes

* bump version manually to publish packages ([b0d01df](https://github.com/standardnotes/server/commit/b0d01dffd91557c67eac2940d9270bca208c1128))

# [1.16.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.15.0...@standardnotes/domain-core@1.16.0) (2023-05-29)

### Features

* add files server as a service to home-server ([#614](https://github.com/standardnotes/server/issues/614)) ([c7d575a](https://github.com/standardnotes/server/commit/c7d575a0ffc7eb3e8799c3835da5727584f4f67b))

# [1.15.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.14.2...@standardnotes/domain-core@1.15.0) (2023-05-16)

### Features

* home-server package initial setup with Api Gateway and Auth services ([#605](https://github.com/standardnotes/server/issues/605)) ([dc71e67](https://github.com/standardnotes/server/commit/dc71e6777fc4c51234b79f6fb409f9f3111cc6a5))

## [1.14.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.14.1...@standardnotes/domain-core@1.14.2) (2023-05-09)

### Bug Fixes

* node engine version requirement in package.json files ([62a0e89](https://github.com/standardnotes/server/commit/62a0e89748ab306566c4aa10b9dc0385fb0f1684))

## [1.14.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.14.0...@standardnotes/domain-core@1.14.1) (2023-05-05)

**Note:** Version bump only for package @standardnotes/domain-core

# [1.14.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.13.0...@standardnotes/domain-core@1.14.0) (2023-05-02)

### Features

* extract cache entry model to domain-core ([#581](https://github.com/standardnotes/server/issues/581)) ([c71f7ff](https://github.com/standardnotes/server/commit/c71f7ff8ad4ffbd7151e8397b5816e383b178eb4))

# [1.13.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.12.0...@standardnotes/domain-core@1.13.0) (2023-04-27)

### Features

* sqlite driver for auth service ([#572](https://github.com/standardnotes/server/issues/572)) ([3aef599](https://github.com/standardnotes/server/commit/3aef5998df2b4cf96c597ffa11a47dfc250d1647))

# [1.12.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.11.3...@standardnotes/domain-core@1.12.0) (2023-03-08)

### Features

* **domain-core:** add internal team user role ([#473](https://github.com/standardnotes/server/issues/473)) ([979a320](https://github.com/standardnotes/server/commit/979a320ca666991ad2b023436f58c59ae168c768))

## [1.11.3](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.11.2...@standardnotes/domain-core@1.11.3) (2023-02-15)

### Bug Fixes

* **domain-core:** remove unnecessary dependencies ([16043a7](https://github.com/standardnotes/server/commit/16043a7d6881378ed3286e08dc9e21e5e6b89171))

## [1.11.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.11.1...@standardnotes/domain-core@1.11.2) (2023-01-20)

**Note:** Version bump only for package @standardnotes/domain-core

## [1.11.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.11.0...@standardnotes/domain-core@1.11.1) (2023-01-16)

### Bug Fixes

* **revisions:** add required role to revisions list response ([e7beee2](https://github.com/standardnotes/server/commit/e7beee278871d2939b058d842404fd6980d7f48a))

# [1.11.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.10.0...@standardnotes/domain-core@1.11.0) (2022-12-15)

### Features

* **domain-core:** add legacy session model ([4084f2f](https://github.com/standardnotes/server/commit/4084f2f5ecf8379ff69d619d3d12495c010c3980))

# [1.10.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.9.0...@standardnotes/domain-core@1.10.0) (2022-12-15)

### Features

* **domain-core:** add session model ([1c4d4c5](https://github.com/standardnotes/server/commit/1c4d4c57dea1187dc130f1ae8b7dc8ede332320f))

# [1.9.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.8.0...@standardnotes/domain-core@1.9.0) (2022-12-07)

### Features

* **domain-core:** rename email subscription rejection level to email level ([c87561f](https://github.com/standardnotes/server/commit/c87561fca782883b84f58b4f0b9f85ecc279ca50))

# [1.8.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.7.0...@standardnotes/domain-core@1.8.0) (2022-12-05)

### Features

* **domain-core:** add email subscription rejection levels ([02f3c85](https://github.com/standardnotes/server/commit/02f3c85796ade7cb69edbdda2367c0d91ac1bdf0))

# [1.7.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.6.0...@standardnotes/domain-core@1.7.0) (2022-12-05)

### Features

* **domain-core:** distinguish between username and email ([06fd404](https://github.com/standardnotes/server/commit/06fd404d44b44a53733f889aabd4da63f21e2f36))

# [1.6.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.5.2...@standardnotes/domain-core@1.6.0) (2022-12-02)

### Features

* **domain-core:** add subscription plan name value object ([800fe9e](https://github.com/standardnotes/server/commit/800fe9e4c80c33f2da8097b5a153f470a23b7984))

## [1.5.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.5.1...@standardnotes/domain-core@1.5.2) (2022-12-02)

### Bug Fixes

* **domain-core:** rename timestamps to dates ([dd86c5b](https://github.com/standardnotes/server/commit/dd86c5bcdf3a1a37d684f6416d4cc6f24497fe5e))

## [1.5.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.5.0...@standardnotes/domain-core@1.5.1) (2022-11-25)

**Note:** Version bump only for package @standardnotes/domain-core

# [1.5.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.4.0...@standardnotes/domain-core@1.5.0) (2022-11-24)

### Features

* **domain-core:** add methods to check role power ([9d90f27](https://github.com/standardnotes/server/commit/9d90f276de8915d91d009909154036ba128687e0))

# [1.4.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.3.0...@standardnotes/domain-core@1.4.0) (2022-11-24)

### Features

* **domain-core:** add role name collection value object ([ae2f8f0](https://github.com/standardnotes/server/commit/ae2f8f086b9f647bb98c59f32375b45243cb0af9))

# [1.3.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.2.2...@standardnotes/domain-core@1.3.0) (2022-11-24)

### Features

* **domain-core:** add role name value object ([748630e](https://github.com/standardnotes/server/commit/748630e1f1ed1dfae2e743cd2b3d3fd91967088c))

## [1.2.2](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.2.1...@standardnotes/domain-core@1.2.2) (2022-11-22)

**Note:** Version bump only for package @standardnotes/domain-core

## [1.2.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.2.0...@standardnotes/domain-core@1.2.1) (2022-11-21)

### Bug Fixes

* **domain-core:** remove revisions related models to revisions microservice ([a6542dd](https://github.com/standardnotes/server/commit/a6542dd63870a8ada5fd8143d8e2133a570d9329))

# [1.2.0](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.1.1...@standardnotes/domain-core@1.2.0) (2022-11-18)

### Features

* **domain-core:** add revision definition to domain core ([c8f3a0c](https://github.com/standardnotes/server/commit/c8f3a0ce7b589a6fbc47941fc5d1a44b6cf04fe3))
* **revisions:** add revisions microservice ([d5c06bf](https://github.com/standardnotes/server/commit/d5c06bfa58a987685fbd8fbab0d22df3fcff3377))

## [1.1.1](https://github.com/standardnotes/server/compare/@standardnotes/domain-core@1.1.0...@standardnotes/domain-core@1.1.1) (2022-11-14)

### Bug Fixes

* **syncing-server:** retrieving revisions ([50f7ae3](https://github.com/standardnotes/server/commit/50f7ae338ad66d3465fa16c31e7c47c57b1e0c3c))

# 1.1.0 (2022-11-14)

### Features

* **analytics:** extract domain core into a separate package ([0f94e2a](https://github.com/standardnotes/server/commit/0f94e2ad0c8927733eac31f130cbe649dce765f9))
