# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.115.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.115.1...@standardnotes/syncing-server@1.115.2) (2023-10-10)

### Bug Fixes

* **syncing-server:** elevate otel sdk before the container starts ([3e4a1e9](https://github.com/standardnotes/syncing-server-js/commit/3e4a1e9645d0c8909caca77bd87e6fc3bf3f9b1f))
* **syncing-server:** elevate otel sdk before the winston import ([250c1f0](https://github.com/standardnotes/syncing-server-js/commit/250c1f069be361b47552c10f1dc7c1f1eb5f07af))

## [1.115.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.115.0...@standardnotes/syncing-server@1.115.1) (2023-10-10)

### Bug Fixes

* transition logs to be more verbose ([036317e](https://github.com/standardnotes/syncing-server-js/commit/036317e33347f121fa799cbd409f85759798369d))

# [1.115.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.114.3...@standardnotes/syncing-server@1.115.0) (2023-10-10)

### Bug Fixes

* **syncing-server:** add option to define otel ratio ([c021bb3](https://github.com/standardnotes/syncing-server-js/commit/c021bb3d7ca90179292e7c75f5a84bf2b941ce86))

### Features

* add more logs to transition ([783fd9e](https://github.com/standardnotes/syncing-server-js/commit/783fd9e2c6350a7f0f1e8d009d01a3328564aca0))

## [1.114.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.114.2...@standardnotes/syncing-server@1.114.3) (2023-10-09)

### Bug Fixes

* **syncing-server:** add opentelemetry starting info in logs ([3ab2956](https://github.com/standardnotes/syncing-server-js/commit/3ab29569dbe23e9d546136c336b39ee1accb513f))

### Reverts

* Revert "Revert "fix: setting parent span on workers"" ([76ae6f5](https://github.com/standardnotes/syncing-server-js/commit/76ae6f5a882a82ab5f635452e3bc7b2b16709531))

## [1.114.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.114.1...@standardnotes/syncing-server@1.114.2) (2023-10-09)

### Reverts

* Revert "fix: setting parent span on workers" ([3fc07a5](https://github.com/standardnotes/syncing-server-js/commit/3fc07a5b60c26b583efd88e8a80d4c4321e71efb))

## [1.114.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.114.0...@standardnotes/syncing-server@1.114.1) (2023-10-09)

### Bug Fixes

* setting parent span on workers ([1c54d18](https://github.com/standardnotes/syncing-server-js/commit/1c54d18c3ca75353701ba921492a5ecfaa2e3572))

# [1.114.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.113.0...@standardnotes/syncing-server@1.114.0) (2023-10-09)

### Features

* add custom tracing on workers ([65ced2c](https://github.com/standardnotes/syncing-server-js/commit/65ced2cc7b0686dc8af5cdad499412fc8fd29d1d))

# [1.113.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.112.4...@standardnotes/syncing-server@1.113.0) (2023-10-09)

### Features

* add opentelemetry to all services ([5e930d0](https://github.com/standardnotes/syncing-server-js/commit/5e930d08eb60a0da800081342315e7edaf130951))

## [1.112.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.112.3...@standardnotes/syncing-server@1.112.4) (2023-10-09)

### Bug Fixes

* remove xray sdk in favor of opentelemetry ([b736dab](https://github.com/standardnotes/syncing-server-js/commit/b736dab3c1f76c9e03c4bc7bbf153dcb3309b7cb))

## [1.112.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.112.2...@standardnotes/syncing-server@1.112.3) (2023-10-09)

### Bug Fixes

* logs in transition ([29e8de3](https://github.com/standardnotes/syncing-server-js/commit/29e8de32383e911bbb431d3fd0da68faefa32d3d))

## [1.112.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.112.1...@standardnotes/syncing-server@1.112.2) (2023-10-06)

### Bug Fixes

* **syncing-server:** calling auth server for user key params ([51ca822](https://github.com/standardnotes/syncing-server-js/commit/51ca8229b8d5ebb3b4573a2a9da12dd8f15bf2ec))
* **syncing-server:** error log on email backup requested ([a6a19a3](https://github.com/standardnotes/syncing-server-js/commit/a6a19a391e0495a0f362b98d0f3a34e4f6539863))

## [1.112.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.112.0...@standardnotes/syncing-server@1.112.1) (2023-10-06)

### Bug Fixes

* **syncing-server:** increase axios timeout on calling auth ([eafb064](https://github.com/standardnotes/syncing-server-js/commit/eafb064d7992dc8aa31f090e4265498c415c5795))
* **syncing-server:** logs on request backup handler ([ba05068](https://github.com/standardnotes/syncing-server-js/commit/ba050681f772c2f566462be57f6b0731141d85b0))

# [1.112.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.111.5...@standardnotes/syncing-server@1.112.0) (2023-10-06)

### Bug Fixes

* enable TransitionRequestedEventHandler ([d8f1c66](https://github.com/standardnotes/syncing-server-js/commit/d8f1c66fd5e59285ccaa1be36da2ee9796b81ccb))

### Features

* switch transition direction ([27bea44](https://github.com/standardnotes/syncing-server-js/commit/27bea444cce4964feda04bad64e5f12a07415e0c))

## [1.111.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.111.4...@standardnotes/syncing-server@1.111.5) (2023-10-06)

### Bug Fixes

* **syncing-server:** add more logs on successfull email backups requested ([8c57f50](https://github.com/standardnotes/syncing-server-js/commit/8c57f505be86f3a7af0ab446a409bac276b2242b))

## [1.111.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.111.3...@standardnotes/syncing-server@1.111.4) (2023-10-06)

### Bug Fixes

* **syncing-server:** error log on email backup request handler ([702a128](https://github.com/standardnotes/syncing-server-js/commit/702a1286eb5ef9414dc64fb91afbefa98b007cf3))

## [1.111.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.111.2...@standardnotes/syncing-server@1.111.3) (2023-10-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.111.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.111.1...@standardnotes/syncing-server@1.111.2) (2023-10-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.111.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.111.0...@standardnotes/syncing-server@1.111.1) (2023-10-05)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.111.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.8...@standardnotes/syncing-server@1.111.0) (2023-10-04)

### Features

* add xray to syncing server and files ([6583ff6](https://github.com/standardnotes/syncing-server-js/commit/6583ff6cd90f7881c1a79c0f904f1b1db96fc5b3))

## [1.110.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.7...@standardnotes/syncing-server@1.110.8) (2023-10-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.110.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.6...@standardnotes/syncing-server@1.110.7) (2023-10-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.110.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.5...@standardnotes/syncing-server@1.110.6) (2023-10-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.110.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.4...@standardnotes/syncing-server@1.110.5) (2023-10-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.110.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.3...@standardnotes/syncing-server@1.110.4) (2023-10-03)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.110.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.2...@standardnotes/syncing-server@1.110.3) (2023-10-03)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.110.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.1...@standardnotes/syncing-server@1.110.2) (2023-10-02)

### Bug Fixes

* temproarily disable transitions to empty overpopulated queues ([cd893b4](https://github.com/standardnotes/syncing-server-js/commit/cd893b41d7371bdc32acc111f7cea797ec33cad5))

## [1.110.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.110.0...@standardnotes/syncing-server@1.110.1) (2023-09-29)

### Bug Fixes

* keep transition in-progress status alive ([032cde7](https://github.com/standardnotes/syncing-server-js/commit/032cde77233076814b1de5791850b4ee4c8dc1f4))

# [1.110.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.109.2...@standardnotes/syncing-server@1.110.0) (2023-09-29)

### Bug Fixes

* add paging memory to integrity check ([e4ca310](https://github.com/standardnotes/syncing-server-js/commit/e4ca310707b12b1c08073a391e8857ee52acd92b))

### Features

* **syncing-server:** allow surviving only upon account deletion ([#857](https://github.com/standardnotes/syncing-server-js/issues/857)) ([609e85f](https://github.com/standardnotes/syncing-server-js/commit/609e85f926ebbc2887656c46df18471c68d70185))

## [1.109.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.109.1...@standardnotes/syncing-server@1.109.2) (2023-09-28)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.109.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.109.0...@standardnotes/syncing-server@1.109.1) (2023-09-27)

### Bug Fixes

* removing items in a vault and notifying about designated survivor ([#855](https://github.com/standardnotes/syncing-server-js/issues/855)) ([1d06ffe](https://github.com/standardnotes/syncing-server-js/commit/1d06ffe9d51722ada7baa040e1d5ed351fc28f39))

# [1.109.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.108.2...@standardnotes/syncing-server@1.109.0) (2023-09-26)

### Features

* refactor handling revision creation from dump ([#854](https://github.com/standardnotes/syncing-server-js/issues/854)) ([ca6dbc0](https://github.com/standardnotes/syncing-server-js/commit/ca6dbc00537bb20f508f9310b1a838421f53a643))

## [1.108.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.108.1...@standardnotes/syncing-server@1.108.2) (2023-09-25)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.108.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.108.0...@standardnotes/syncing-server@1.108.1) (2023-09-25)

### Bug Fixes

* refactor the structure of notifications ([#853](https://github.com/standardnotes/syncing-server-js/issues/853)) ([cebab59](https://github.com/standardnotes/syncing-server-js/commit/cebab59a026c6868886e0945787a8ddb0442fbc3))
* **syncing-server:** another spec ([3d5e747](https://github.com/standardnotes/syncing-server-js/commit/3d5e7475901c5eb7741f461a35febdb996bcfd1d))
* **syncing-server:** specs ([9446774](https://github.com/standardnotes/syncing-server-js/commit/94467747acca83b954129702111f903c3d1ceab8))

# [1.108.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.107.0...@standardnotes/syncing-server@1.108.0) (2023-09-25)

### Features

* remove shared vault files upon shared vault removal ([#852](https://github.com/standardnotes/syncing-server-js/issues/852)) ([7b1eec2](https://github.com/standardnotes/syncing-server-js/commit/7b1eec21e54330bebbeebb80cec3ba4284112aab))

# [1.107.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.106.0...@standardnotes/syncing-server@1.107.0) (2023-09-25)

### Features

* **syncing-server:** transfer shared vault items ([#851](https://github.com/standardnotes/syncing-server-js/issues/851)) ([a8f03e1](https://github.com/standardnotes/syncing-server-js/commit/a8f03e157be3d277e60d2756dd25c953775b1ba4))

# [1.106.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.105.1...@standardnotes/syncing-server@1.106.0) (2023-09-25)

### Features

* add storing paging progress in redis ([9759814](https://github.com/standardnotes/syncing-server-js/commit/9759814f637b8ae25b325e35bc7f5159747980b6))

## [1.105.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.105.0...@standardnotes/syncing-server@1.105.1) (2023-09-25)

### Bug Fixes

* add paging progress log ([8cb33dc](https://github.com/standardnotes/syncing-server-js/commit/8cb33dc906391ee8b1ebd333937045c328e4fc06))
* remember paging progress on transitioning ([1d73e4f](https://github.com/standardnotes/syncing-server-js/commit/1d73e4f0720d41029af4d4b2b7a10d101add6c82))

# [1.105.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.104.0...@standardnotes/syncing-server@1.105.0) (2023-09-22)

### Bug Fixes

* add more logs to transition process ([0562b0a](https://github.com/standardnotes/syncing-server-js/commit/0562b0a621eb878026fbdc0346b6170e815b64bf))
* remove excessive logs ([15ed1fd](https://github.com/standardnotes/syncing-server-js/commit/15ed1fd789aba306cbec6a23e88d5c1f837dabc0))

### Features

* **syncing-server:** transfer shared vault ownership to designated survivor upon account deletion ([#845](https://github.com/standardnotes/syncing-server-js/issues/845)) ([0a1080c](https://github.com/standardnotes/syncing-server-js/commit/0a1080ce2a0fb021309a960de2c40193acab46eb))

# [1.104.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.103.1...@standardnotes/syncing-server@1.104.0) (2023-09-22)

### Features

* **syncing-server:** add designated survivors in fetching shared vaults response ([#844](https://github.com/standardnotes/syncing-server-js/issues/844)) ([bcd95cd](https://github.com/standardnotes/syncing-server-js/commit/bcd95cdbe9054d4ca39d5dc0486b6a0c0b6f52da))

## [1.103.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.103.0...@standardnotes/syncing-server@1.103.1) (2023-09-22)

### Bug Fixes

* disable cleaning secondary database on transition ([4f4443a](https://github.com/standardnotes/syncing-server-js/commit/4f4443a882f69c2e76ef831ef36347c9c54f31cd))
* integrity check during transition ([921c30f](https://github.com/standardnotes/syncing-server-js/commit/921c30f6415ef122a7d1af83ffa3f6840a42edba))
* processing migration optimization ([22540ee](https://github.com/standardnotes/syncing-server-js/commit/22540ee83436b986949127a6923285a702162706))

# [1.103.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.102.2...@standardnotes/syncing-server@1.103.0) (2023-09-22)

### Features

* remove user from all shared vaults upon account deletion ([#843](https://github.com/standardnotes/syncing-server-js/issues/843)) ([dc77ff3](https://github.com/standardnotes/syncing-server-js/commit/dc77ff3e45983d231bc9c132802428e77b4be431))

## [1.102.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.102.1...@standardnotes/syncing-server@1.102.2) (2023-09-22)

### Bug Fixes

* **syncing-server:** error message ([d0fd6b9](https://github.com/standardnotes/syncing-server-js/commit/d0fd6b98df58f6bd2050ff415515c692ecd32bef))

## [1.102.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.102.0...@standardnotes/syncing-server@1.102.1) (2023-09-21)

### Bug Fixes

* **syncing-server:** add missing binding ([a5da42b](https://github.com/standardnotes/syncing-server-js/commit/a5da42bdddc9bad0d641ad9a50932133b76a546a))

# [1.102.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.101.1...@standardnotes/syncing-server@1.102.0) (2023-09-21)

### Features

* add designating a survivor in shared vault ([#841](https://github.com/standardnotes/syncing-server-js/issues/841)) ([230c96d](https://github.com/standardnotes/syncing-server-js/commit/230c96dcf1d8faed9ce8fe288549226da70317e6))

## [1.101.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.101.0...@standardnotes/syncing-server@1.101.1) (2023-09-21)

### Bug Fixes

* secondary database catch up time ([880db10](https://github.com/standardnotes/syncing-server-js/commit/880db1038a39d4610a2593489a18e207487347a2))

# [1.101.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.100.0...@standardnotes/syncing-server@1.101.0) (2023-09-20)

### Features

* add unassigning items and revisions upon shared vault removal ([#839](https://github.com/standardnotes/syncing-server-js/issues/839)) ([378eced](https://github.com/standardnotes/syncing-server-js/commit/378ecedfcc4fb23475c2329fb37479edb3b48a39))
* **syncing-server:** distinct notifications upon user removal from shared vault ([#840](https://github.com/standardnotes/syncing-server-js/issues/840)) ([41e2136](https://github.com/standardnotes/syncing-server-js/commit/41e2136bc07312974701a70652528d304105e0f9))

# [1.100.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.99.0...@standardnotes/syncing-server@1.100.0) (2023-09-20)

### Features

* **syncing-server:** remove owned shared vaults upon account deletion ([#838](https://github.com/standardnotes/syncing-server-js/issues/838)) ([22a8cc9](https://github.com/standardnotes/syncing-server-js/commit/22a8cc90f1232fd5f5646f613c80bd7c60186670))

# [1.99.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.98.6...@standardnotes/syncing-server@1.99.0) (2023-09-20)

### Features

* **syncing-server:** add notification for user upon declined shared vault invitation ([#837](https://github.com/standardnotes/syncing-server-js/issues/837)) ([31e7aaf](https://github.com/standardnotes/syncing-server-js/commit/31e7aaf253029a951d8b943d6cffd655cd5ca765))

## [1.98.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.98.5...@standardnotes/syncing-server@1.98.6) (2023-09-19)

### Bug Fixes

* skip removing already existing content in secondary to pick up where the transition left of ([857c6af](https://github.com/standardnotes/syncing-server-js/commit/857c6af9468ec829ff4dce9a96ba7bf9c14d55a5))

## [1.98.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.98.4...@standardnotes/syncing-server@1.98.5) (2023-09-19)

### Bug Fixes

* increase timeout for secondary database to catch up for indexes to be rebuilt ([b265a39](https://github.com/standardnotes/syncing-server-js/commit/b265a39b635373c36ee8c3d8e09f0631159b3574))
* logs verbosity during transitions ([e589029](https://github.com/standardnotes/syncing-server-js/commit/e589029722ab9f4debc8aa6cc78913f877eda2e3))

## [1.98.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.98.3...@standardnotes/syncing-server@1.98.4) (2023-09-19)

### Bug Fixes

* add checking for secondary items logs ([a1a3e9f](https://github.com/standardnotes/syncing-server-js/commit/a1a3e9f586358b943b1b490a1382e42f081f7d06))
* logs for removing already existing content and paging through diff of the content ([a40b17b](https://github.com/standardnotes/syncing-server-js/commit/a40b17b141f1d5954e1a45b969d5a941386c68d0))

## [1.98.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.98.2...@standardnotes/syncing-server@1.98.3) (2023-09-19)

### Bug Fixes

* logs formatting during transition for better readability ([0ae028d](https://github.com/standardnotes/syncing-server-js/commit/0ae028db739decec8c50321b18b0af515e00bd23))

## [1.98.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.98.1...@standardnotes/syncing-server@1.98.2) (2023-09-19)

### Bug Fixes

* **syncing-server:** paging through already existing items ([e4fcd73](https://github.com/standardnotes/syncing-server-js/commit/e4fcd738c35a4dc96e57db6ca08383a5647d61ad))

## [1.98.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.98.0...@standardnotes/syncing-server@1.98.1) (2023-09-18)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.98.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.97.0...@standardnotes/syncing-server@1.98.0) (2023-09-18)

### Features

* add publishing notifications for users when a user is added to vault ([#834](https://github.com/standardnotes/syncing-server-js/issues/834)) ([547a79e](https://github.com/standardnotes/syncing-server-js/commit/547a79e23174dab0a756e4e5bee218e4859b3b42))

# [1.97.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.96.1...@standardnotes/syncing-server@1.97.0) (2023-09-15)

### Features

* refactor transition to minimize status changes ([#828](https://github.com/standardnotes/syncing-server-js/issues/828)) ([36f07c6](https://github.com/standardnotes/syncing-server-js/commit/36f07c691afc213ecf817d6e98f885ddb19a6ed6))

## [1.96.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.96.0...@standardnotes/syncing-server@1.96.1) (2023-09-15)

### Bug Fixes

* add debug logs for transition status updates ([3e7856c](https://github.com/standardnotes/syncing-server-js/commit/3e7856c895e73b775c8977c6c6e86dffd5755c00))

# [1.96.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.19...@standardnotes/syncing-server@1.96.0) (2023-09-15)

### Features

* add skipping verified transitions ([#827](https://github.com/standardnotes/syncing-server-js/issues/827)) ([d4d4945](https://github.com/standardnotes/syncing-server-js/commit/d4d49454a68de0acdf440dc202fa14b9743905f6))

## [1.95.19](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.18...@standardnotes/syncing-server@1.95.19) (2023-09-15)

### Bug Fixes

* **syncing-server:** remove unused index in mongodb ([9147ff5](https://github.com/standardnotes/syncing-server-js/commit/9147ff5d49c507d943f4f8c6775f7c1fff878b0f))

## [1.95.18](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.17...@standardnotes/syncing-server@1.95.18) (2023-09-14)

### Bug Fixes

* skip already updated items and revisions in integrity check ([#825](https://github.com/standardnotes/syncing-server-js/issues/825)) ([03a4a3f](https://github.com/standardnotes/syncing-server-js/commit/03a4a3f2abc0b4e09942ba39dbd227524068dfb6))
* **syncing-server:** updating with missing creation date ([#824](https://github.com/standardnotes/syncing-server-js/issues/824)) ([3a8607d](https://github.com/standardnotes/syncing-server-js/commit/3a8607d1465cabedad68b84c753e407342e60d20))

## [1.95.17](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.16...@standardnotes/syncing-server@1.95.17) (2023-09-13)

### Bug Fixes

* adjust transition timestamps to be universal ([c7807d0](https://github.com/standardnotes/syncing-server-js/commit/c7807d0f9e69ce572c4c03ff606375d706f24d9f))

## [1.95.16](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.15...@standardnotes/syncing-server@1.95.16) (2023-09-13)

### Bug Fixes

* include handling updated items in revisions in secondary ([fbcb45c](https://github.com/standardnotes/syncing-server-js/commit/fbcb45c3a23fde09702fae7bfcb409bdbb610191))

## [1.95.15](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.14...@standardnotes/syncing-server@1.95.15) (2023-09-13)

### Bug Fixes

* display transition progress in logs ([38685c1](https://github.com/standardnotes/syncing-server-js/commit/38685c1861b13e398dd96aa39f2cf1aece2090fb))

## [1.95.14](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.13...@standardnotes/syncing-server@1.95.14) (2023-09-13)

### Bug Fixes

* setting status for already migrated users ([9be4c00](https://github.com/standardnotes/syncing-server-js/commit/9be4c002b755fea057489b6077b297162223aefe))

## [1.95.13](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.12...@standardnotes/syncing-server@1.95.13) (2023-09-13)

### Bug Fixes

* cleanup only for 0 new items ([b1d88b1](https://github.com/standardnotes/syncing-server-js/commit/b1d88b15be78a48224963e337a222fb675ed2692))
* **syncing-server:** add catch up timeout for secondary db ([ff78285](https://github.com/standardnotes/syncing-server-js/commit/ff78285e43db849bdc44caa36f602150562b4d81))
* **syncing-server:** case insensitive integrity check ([d5536f5](https://github.com/standardnotes/syncing-server-js/commit/d5536f54304e2aecd59dbece7650254f7c2101bb))

## [1.95.12](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.11...@standardnotes/syncing-server@1.95.12) (2023-09-12)

### Bug Fixes

* sync between primary and secondary database with diff ([fab5d18](https://github.com/standardnotes/syncing-server-js/commit/fab5d180645e0a6fa0c9c67205d44f27c8a65c8b))

## [1.95.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.10...@standardnotes/syncing-server@1.95.11) (2023-09-12)

### Bug Fixes

* **syncing-server:** binding ([e91a832](https://github.com/standardnotes/syncing-server-js/commit/e91a8321527ac269ba9822ce270184db5bc57099))

## [1.95.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.9...@standardnotes/syncing-server@1.95.10) (2023-09-12)

### Bug Fixes

* retry failed revision transitions ([e535cd5](https://github.com/standardnotes/syncing-server-js/commit/e535cd504cf1929539ff7faf13e9c1fdd2b7bfd1))
* **syncing-server:** log syncing errors ([b9c9f74](https://github.com/standardnotes/syncing-server-js/commit/b9c9f74d0c699cf72ea6090627bd5716ac8360d7))

## [1.95.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.8...@standardnotes/syncing-server@1.95.9) (2023-09-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.95.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.7...@standardnotes/syncing-server@1.95.8) (2023-09-12)

### Bug Fixes

* **syncing-server:** allow fetching shared vault users for members ([#821](https://github.com/standardnotes/syncing-server-js/issues/821)) ([25047bf](https://github.com/standardnotes/syncing-server-js/commit/25047bf46dfabba7b12eafb59519de3f08822e45))

## [1.95.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.6...@standardnotes/syncing-server@1.95.7) (2023-09-12)

### Bug Fixes

* comparing uuids ([0a1d162](https://github.com/standardnotes/syncing-server-js/commit/0a1d1624e818000f2e951f29323a88e6e233c755))

## [1.95.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.5...@standardnotes/syncing-server@1.95.6) (2023-09-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.95.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.4...@standardnotes/syncing-server@1.95.5) (2023-09-12)

### Bug Fixes

* adjust transitions to not create revisions during ongoing revisions transition ([106d8f9](https://github.com/standardnotes/syncing-server-js/commit/106d8f9192f630794ca4ddc2c4503f2c6cd196e7))

## [1.95.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.3...@standardnotes/syncing-server@1.95.4) (2023-09-12)

### Bug Fixes

* transition adjustments ([f20a947](https://github.com/standardnotes/syncing-server-js/commit/f20a947f8a555c074d8dc1543c7a8bf61d1d887e))

## [1.95.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.2...@standardnotes/syncing-server@1.95.3) (2023-09-11)

### Bug Fixes

* debug sync block ([1d751c0](https://github.com/standardnotes/syncing-server-js/commit/1d751c0fbe434f661466dde804a37849f23d9b1b))

## [1.95.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.1...@standardnotes/syncing-server@1.95.2) (2023-09-11)

### Bug Fixes

* **auth:** remove transitioning upon sign out ([#819](https://github.com/standardnotes/syncing-server-js/issues/819)) ([330bff0](https://github.com/standardnotes/syncing-server-js/commit/330bff0124f5f49c3441304d166ea43c21fea7bc))

## [1.95.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.95.0...@standardnotes/syncing-server@1.95.1) (2023-09-11)

### Bug Fixes

* disable running migrations in worker mode of a given service ([a82b9a0](https://github.com/standardnotes/syncing-server-js/commit/a82b9a0c8a023ba8a450ff9e34bcd62f928fcab3))

# [1.95.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.94.0...@standardnotes/syncing-server@1.95.0) (2023-09-08)

### Features

* transition users after sign out ([398338c](https://github.com/standardnotes/syncing-server-js/commit/398338c8f81b12406c7ab3bf1654e60b94d7cfd0))

# [1.94.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.93.1...@standardnotes/syncing-server@1.94.0) (2023-09-08)

### Features

* **syncing-server:** add procedure to trigger transition for specific user ([8cb92d9](https://github.com/standardnotes/syncing-server-js/commit/8cb92d9678cffe9188fa2b038f1b5a9e0247551e))

## [1.93.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.93.0...@standardnotes/syncing-server@1.93.1) (2023-09-07)

### Bug Fixes

* **syncing-server:** invalidating cache for user removed from shared vault ([#812](https://github.com/standardnotes/syncing-server-js/issues/812)) ([c4a1502](https://github.com/standardnotes/syncing-server-js/commit/c4a1502f70e675da5c81c4005ee1eca578a7e3f4))

# [1.93.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.92.1...@standardnotes/syncing-server@1.93.0) (2023-09-07)

### Features

* add removing revisions from shared vaults ([#811](https://github.com/standardnotes/syncing-server-js/issues/811)) ([3bd63f7](https://github.com/standardnotes/syncing-server-js/commit/3bd63f767464baf9b9f1ffa52eea9eed4a4e11b5))

## [1.92.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.92.0...@standardnotes/syncing-server@1.92.1) (2023-09-07)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.92.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.91.3...@standardnotes/syncing-server@1.92.0) (2023-09-06)

### Features

* should be able to access shared item revisions as third party user ([#807](https://github.com/standardnotes/syncing-server-js/issues/807)) ([794cd87](https://github.com/standardnotes/syncing-server-js/commit/794cd8734acf89fb29f09dfb169a3f08f252bb6a))

## [1.91.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.91.2...@standardnotes/syncing-server@1.91.3) (2023-09-04)

### Bug Fixes

* prevent doubling transitions ([d9ee2c5](https://github.com/standardnotes/syncing-server-js/commit/d9ee2c5be2d81c729c829e6078846df624d500bd))

## [1.91.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.91.1...@standardnotes/syncing-server@1.91.2) (2023-09-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.91.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.91.0...@standardnotes/syncing-server@1.91.1) (2023-09-01)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.91.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.90.0...@standardnotes/syncing-server@1.91.0) (2023-09-01)

### Bug Fixes

* inserting revisions instead of upsert ([#803](https://github.com/standardnotes/syncing-server-js/issues/803)) ([27ff25b](https://github.com/standardnotes/syncing-server-js/commit/27ff25b70e6b65dfe89aa35582422dce682a4105))

### Features

* **syncing-server:** add sending invites via websockets ([#804](https://github.com/standardnotes/syncing-server-js/issues/804)) ([dc3a41e](https://github.com/standardnotes/syncing-server-js/commit/dc3a41e4bb3f3541f812b938fd42a6192e3e20f8))

# [1.90.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.89.0...@standardnotes/syncing-server@1.90.0) (2023-09-01)

### Bug Fixes

* remove the alive and kicking info logs on workers ([1bef127](https://github.com/standardnotes/syncing-server-js/commit/1bef1279e6dbf3cbdfa87e44aa9108ed6dbb3b0f))

### Features

* send websocket event to user when a message is sent ([#802](https://github.com/standardnotes/syncing-server-js/issues/802)) ([9a568b0](https://github.com/standardnotes/syncing-server-js/commit/9a568b0f73078ab74d4771bac469903a124e67da))

# [1.89.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.88.3...@standardnotes/syncing-server@1.89.0) (2023-08-31)

### Features

* add sending notifications to user via websockets ([#799](https://github.com/standardnotes/syncing-server-js/issues/799)) ([c0722b1](https://github.com/standardnotes/syncing-server-js/commit/c0722b173b71d696568d8e8c5095a22fd219bef6))

## [1.88.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.88.2...@standardnotes/syncing-server@1.88.3) (2023-08-31)

### Bug Fixes

* **syncing-server:** persistence mapping for deleted field ([baf4b2c](https://github.com/standardnotes/syncing-server-js/commit/baf4b2c1d205929be8c330450dca16c18ad5cdd6))

## [1.88.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.88.1...@standardnotes/syncing-server@1.88.2) (2023-08-31)

### Bug Fixes

* transitionining revisions ([#801](https://github.com/standardnotes/syncing-server-js/issues/801)) ([596a0f1](https://github.com/standardnotes/syncing-server-js/commit/596a0f1a0221ab0636c4c04d17a28c57fe74b620))

## [1.88.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.88.0...@standardnotes/syncing-server@1.88.1) (2023-08-30)

### Bug Fixes

* mongo delete queries ([ec35f46](https://github.com/standardnotes/syncing-server-js/commit/ec35f46d457ec5a5125dc1d0f1a14fb262012caa))

# [1.88.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.87.0...@standardnotes/syncing-server@1.88.0) (2023-08-30)

### Features

* **revisions:** add procedure for transitioning data from primary to secondary database ([#787](https://github.com/standardnotes/syncing-server-js/issues/787)) ([fe273a9](https://github.com/standardnotes/syncing-server-js/commit/fe273a9107585b5953c8de1d0f8afb951f891bca))

# [1.87.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.86.0...@standardnotes/syncing-server@1.87.0) (2023-08-30)

### Features

* choose primary or secondary revisions database based on transition role ([#716](https://github.com/standardnotes/syncing-server-js/issues/716)) ([62d231a](https://github.com/standardnotes/syncing-server-js/commit/62d231ae41a75fcfc49cef0f5f17b647af2b6f45))

# [1.86.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.85.1...@standardnotes/syncing-server@1.86.0) (2023-08-29)

### Features

* **revisions:** add MongoDB support ([#715](https://github.com/standardnotes/syncing-server-js/issues/715)) ([2646b75](https://github.com/standardnotes/syncing-server-js/commit/2646b756a95c425bd406622bfe3a9aa4c490d537))

## [1.85.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.85.0...@standardnotes/syncing-server@1.85.1) (2023-08-28)

### Bug Fixes

* allow self hosted to use new model of items ([#714](https://github.com/standardnotes/syncing-server-js/issues/714)) ([aef9254](https://github.com/standardnotes/syncing-server-js/commit/aef9254713560c00a90a3e84e3cd94417e8f30d2))

# [1.85.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.84.2...@standardnotes/syncing-server@1.85.0) (2023-08-28)

### Features

* **syncing-server:** distinguish between legacy and current items model usage ([#712](https://github.com/standardnotes/syncing-server-js/issues/712)) ([bf8f91f](https://github.com/standardnotes/syncing-server-js/commit/bf8f91f83d9d206ebfbcd9b2c9318786bd0040da))
* **syncing-server:** turn mysql items model into legacy ([#711](https://github.com/standardnotes/syncing-server-js/issues/711)) ([effdfeb](https://github.com/standardnotes/syncing-server-js/commit/effdfebc193c66d830bb4d516d408a9c126f3d62))

## [1.84.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.84.1...@standardnotes/syncing-server@1.84.2) (2023-08-25)

### Bug Fixes

* **syncing-server:** items sorting in MongoDB ([#710](https://github.com/standardnotes/syncing-server-js/issues/710)) ([152a5cb](https://github.com/standardnotes/syncing-server-js/commit/152a5cbd27375adbad8b070d1778b256a6dce1f4))
* **syncing-server:** logs severity on creating duplicates ([1488763](https://github.com/standardnotes/syncing-server-js/commit/14887631153b78117ec7433353bb32709209a617))

## [1.84.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.84.0...@standardnotes/syncing-server@1.84.1) (2023-08-25)

### Bug Fixes

* **syncing-server:** handling mixed values of deleted flag in MongoDB ([#708](https://github.com/standardnotes/syncing-server-js/issues/708)) ([3ba673b](https://github.com/standardnotes/syncing-server-js/commit/3ba673b424ae3bb6b64b2360323d7373636c6cd5))

# [1.84.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.83.0...@standardnotes/syncing-server@1.84.0) (2023-08-24)

### Features

* add trigerring items transition and checking status of it ([#707](https://github.com/standardnotes/syncing-server-js/issues/707)) ([05bb12c](https://github.com/standardnotes/syncing-server-js/commit/05bb12c97899824f06e6d01d105dec75fc328440))

# [1.83.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.82.0...@standardnotes/syncing-server@1.83.0) (2023-08-23)

### Features

* add handling file moving and updating storage quota ([#705](https://github.com/standardnotes/syncing-server-js/issues/705)) ([205a1ed](https://github.com/standardnotes/syncing-server-js/commit/205a1ed637b626be13fc656276508f3c7791024f))

# [1.82.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.81.0...@standardnotes/syncing-server@1.82.0) (2023-08-22)

### Features

* consider shared vault owner quota when uploading files to shared vault ([#704](https://github.com/standardnotes/syncing-server-js/issues/704)) ([34085ac](https://github.com/standardnotes/syncing-server-js/commit/34085ac6fb7e61d471bd3b4ae8e72112df25c3ee))

# [1.81.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.80.0...@standardnotes/syncing-server@1.81.0) (2023-08-21)

### Bug Fixes

* **syncing-server:** DocumentDB retry writes support ([#703](https://github.com/standardnotes/syncing-server-js/issues/703)) ([15a7f0e](https://github.com/standardnotes/syncing-server-js/commit/15a7f0e71ac2f6c355fb73208559a8fd822773aa))

### Features

* **syncing-server:** add use case for migrating items from one database to another ([#701](https://github.com/standardnotes/syncing-server-js/issues/701)) ([032fcb9](https://github.com/standardnotes/syncing-server-js/commit/032fcb938d9f81381dd9879af4bda9254ee8c499))

# [1.80.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.79.1...@standardnotes/syncing-server@1.80.0) (2023-08-18)

### Features

* add mechanism for determining if a user should use the primary or secondary items database ([#700](https://github.com/standardnotes/syncing-server-js/issues/700)) ([302b624](https://github.com/standardnotes/syncing-server-js/commit/302b624504f4c87fd7c3ddfee77cbdc14a61018b))

## [1.79.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.79.0...@standardnotes/syncing-server@1.79.1) (2023-08-17)

### Bug Fixes

* **syncing-server:** refactor shared vault and key system associations ([#698](https://github.com/standardnotes/syncing-server-js/issues/698)) ([31d1eef](https://github.com/standardnotes/syncing-server-js/commit/31d1eef7f74310b176085311fc04c2efc4a7059f))

# [1.79.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.11...@standardnotes/syncing-server@1.79.0) (2023-08-16)

### Features

* add mongodb initial support ([#696](https://github.com/standardnotes/syncing-server-js/issues/696)) ([b24b576](https://github.com/standardnotes/syncing-server-js/commit/b24b5762093c0f48a28dfb879339c1b9927c9333))

## [1.78.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.10...@standardnotes/syncing-server@1.78.11) (2023-08-11)

### Reverts

* Revert "tmp: disable shared vaults" ([d02124f](https://github.com/standardnotes/syncing-server-js/commit/d02124f4e505e4f7e7510637c461fdd0552c381a))
* Revert "tmp: disable decorating with associations on revisions" ([ad4b85b](https://github.com/standardnotes/syncing-server-js/commit/ad4b85b095a8539955f7b47d51643121d33eed6a))
* Revert "tmp: disable decorating items completely" ([0bf7d8b](https://github.com/standardnotes/syncing-server-js/commit/0bf7d8beae2de1b86d95711a4e15e84b8bf5e9c0))

## [1.78.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.9...@standardnotes/syncing-server@1.78.10) (2023-08-11)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.78.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.8...@standardnotes/syncing-server@1.78.9) (2023-08-11)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.78.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.7...@standardnotes/syncing-server@1.78.8) (2023-08-11)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.78.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.6...@standardnotes/syncing-server@1.78.7) (2023-08-11)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.78.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.5...@standardnotes/syncing-server@1.78.6) (2023-08-10)

### Bug Fixes

* **syncing-server:** setting user uuid in notifications ([56f4975](https://github.com/standardnotes/syncing-server-js/commit/56f49752b43fa1d3dff4f1e3a8f07cd7739516a9))

## [1.78.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.4...@standardnotes/syncing-server@1.78.5) (2023-08-09)

### Reverts

* Revert "tmp: disable fetching shared vault items" ([0eb86c0](https://github.com/standardnotes/syncing-server-js/commit/0eb86c009678a468bf9a7d0079dac58eff48f4d7))
* Revert "Revert "feat(syncing-server): notify shared vault users upon file uploads or removals (#692)"" ([1c3ff52](https://github.com/standardnotes/syncing-server-js/commit/1c3ff526b7c4885f71f019f6c01142f522a6f8ad)), closes [#692](https://github.com/standardnotes/syncing-server-js/issues/692)

## [1.78.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.3...@standardnotes/syncing-server@1.78.4) (2023-08-09)

### Bug Fixes

* **syncing-server:** casting handlers ([d7965b2](https://github.com/standardnotes/syncing-server-js/commit/d7965b2748ad59b1bff0cd6c0bf691303d9a6a76))

### Reverts

* Revert "Revert "fix(syncing-server): update storage quota used in a shared vault (#691)"" ([cbcd2ec](https://github.com/standardnotes/syncing-server-js/commit/cbcd2ec87ac5b94e06608da0426d7c27e5e56146)), closes [#691](https://github.com/standardnotes/syncing-server-js/issues/691)

## [1.78.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.2...@standardnotes/syncing-server@1.78.3) (2023-08-09)

### Reverts

* Revert "fix(syncing-server): update storage quota used in a shared vault (#691)" ([66f9352](https://github.com/standardnotes/syncing-server-js/commit/66f9352a062f45b5c66e7aae9681a56ca3ec6084)), closes [#691](https://github.com/standardnotes/syncing-server-js/issues/691)

## [1.78.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.1...@standardnotes/syncing-server@1.78.2) (2023-08-09)

### Reverts

* Revert "feat(syncing-server): notify shared vault users upon file uploads or removals (#692)" ([d261c81](https://github.com/standardnotes/syncing-server-js/commit/d261c81cd0bdbb9001c8589224f007ed2d338903)), closes [#692](https://github.com/standardnotes/syncing-server-js/issues/692)

## [1.78.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.78.0...@standardnotes/syncing-server@1.78.1) (2023-08-09)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.78.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.77.2...@standardnotes/syncing-server@1.78.0) (2023-08-09)

### Features

* **syncing-server:** notify shared vault users upon file uploads or removals ([#692](https://github.com/standardnotes/syncing-server-js/issues/692)) ([46867c1](https://github.com/standardnotes/syncing-server-js/commit/46867c1a4dd310c1971ff37e1bdf380c10e478fd))

## [1.77.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.77.1...@standardnotes/syncing-server@1.77.2) (2023-08-09)

### Bug Fixes

* **syncing-server:** update storage quota used in a shared vault ([#691](https://github.com/standardnotes/syncing-server-js/issues/691)) ([3415cae](https://github.com/standardnotes/syncing-server-js/commit/3415cae093ecd3631b924e722d4bd1d5015dd37a))

## [1.77.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.77.0...@standardnotes/syncing-server@1.77.1) (2023-08-08)

### Bug Fixes

* **syncing-server:** inviting already existing members to shared vault ([#690](https://github.com/standardnotes/syncing-server-js/issues/690)) ([0a16ee6](https://github.com/standardnotes/syncing-server-js/commit/0a16ee64fecc8d61d4a77fcf8c2c239691616000))

# [1.77.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.76.1...@standardnotes/syncing-server@1.77.0) (2023-08-08)

### Features

* update storage quota used for user based on shared vault files ([#689](https://github.com/standardnotes/syncing-server-js/issues/689)) ([5311e74](https://github.com/standardnotes/syncing-server-js/commit/5311e7426617da6fc75593dd0fcbff589ca4fc22))

## [1.76.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.76.0...@standardnotes/syncing-server@1.76.1) (2023-08-08)

### Bug Fixes

* **syncing-server:** race condition when adding admin user to newly created shared vault ([#688](https://github.com/standardnotes/syncing-server-js/issues/688)) ([3bd1547](https://github.com/standardnotes/syncing-server-js/commit/3bd1547ce3f599306f3942ce0a46f98cebfd33a4))

# [1.76.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.75.4...@standardnotes/syncing-server@1.76.0) (2023-08-07)

### Features

* **syncing-server:** limit shared vaults creation based on role ([#687](https://github.com/standardnotes/syncing-server-js/issues/687)) ([19b8921](https://github.com/standardnotes/syncing-server-js/commit/19b8921f286ff8f88c427e8ddd4512a8d61edb4f))

## [1.75.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.75.3...@standardnotes/syncing-server@1.75.4) (2023-08-03)

### Bug Fixes

* **syncing-server:** skip retrieval of items with invalid uuids ([#683](https://github.com/standardnotes/syncing-server-js/issues/683)) ([0036d52](https://github.com/standardnotes/syncing-server-js/commit/0036d527bd31cd81eda59e918b5f897f24cfa340))

## [1.75.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.75.2...@standardnotes/syncing-server@1.75.3) (2023-08-03)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.75.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.75.1...@standardnotes/syncing-server@1.75.2) (2023-08-02)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.75.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.75.0...@standardnotes/syncing-server@1.75.1) (2023-08-02)

### Bug Fixes

* **syncing-server:** update unknown content type on items migration ([6aad7cd](https://github.com/standardnotes/syncing-server-js/commit/6aad7cd207dcacd4ee372e7a6e6ebc60a75cea2a))

# [1.75.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.74.1...@standardnotes/syncing-server@1.75.0) (2023-08-02)

### Features

* enable Write Ahead Log mode for SQLite ([#681](https://github.com/standardnotes/syncing-server-js/issues/681)) ([8cd7a13](https://github.com/standardnotes/syncing-server-js/commit/8cd7a138ab56f6a2b0d6c06ef6041ab9b85ae540))

## [1.74.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.74.0...@standardnotes/syncing-server@1.74.1) (2023-08-02)

### Bug Fixes

* **syncing-server:** encapsulate delete queries into transactions ([2ca649c](https://github.com/standardnotes/syncing-server-js/commit/2ca649cf314617f01107f8479928df1581c924db))

# [1.74.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.73.1...@standardnotes/syncing-server@1.74.0) (2023-08-01)

### Features

* **syncing-server:** remove legacy privileges items ([#679](https://github.com/standardnotes/syncing-server-js/issues/679)) ([e9bba6f](https://github.com/standardnotes/syncing-server-js/commit/e9bba6fd3acfde62c3063160ba3ec3aa83c45b31))

## [1.73.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.73.0...@standardnotes/syncing-server@1.73.1) (2023-08-01)

### Bug Fixes

* controller naming ([#678](https://github.com/standardnotes/syncing-server-js/issues/678)) ([56f0aef](https://github.com/standardnotes/syncing-server-js/commit/56f0aef21d3fcec7ac7e968cb1c1b071becbbe26))

# [1.73.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.72.2...@standardnotes/syncing-server@1.73.0) (2023-08-01)

### Features

* **syncing-server:** add shared vault snjs filter ([#677](https://github.com/standardnotes/syncing-server-js/issues/677)) ([b9bb83c](https://github.com/standardnotes/syncing-server-js/commit/b9bb83c0ce8d326b8deeb93afac9e9251750de29))

## [1.72.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.72.1...@standardnotes/syncing-server@1.72.2) (2023-07-30)

### Bug Fixes

* missing var reference and brackets ([#675](https://github.com/standardnotes/syncing-server-js/issues/675)) ([053852b](https://github.com/standardnotes/syncing-server-js/commit/053852b46c0c7fad4674a7d05c748c573251607a))

## [1.72.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.72.0...@standardnotes/syncing-server@1.72.1) (2023-07-27)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.72.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.71.0...@standardnotes/syncing-server@1.72.0) (2023-07-27)

### Features

* **syncing-server:** add deleting outbound messages ([e8ba49e](https://github.com/standardnotes/syncing-server-js/commit/e8ba49ecca38ab10c0ea0e1f4cf4db9fb17366db))

# [1.71.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.70.5...@standardnotes/syncing-server@1.71.0) (2023-07-26)

### Features

* extract shared vault user permission to domain-core ([e215ac4](https://github.com/standardnotes/syncing-server-js/commit/e215ac4343e9f8818f40004d31390d6ac23e369d))

## [1.70.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.70.4...@standardnotes/syncing-server@1.70.5) (2023-07-26)

### Bug Fixes

* **syncing-server:** uuid comparison when removing user ([886ccf8](https://github.com/standardnotes/syncing-server-js/commit/886ccf84c1f3b9309ce7d01354ca815af1424b72))

## [1.70.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.70.3...@standardnotes/syncing-server@1.70.4) (2023-07-26)

### Bug Fixes

* **syncing-serve:** removing other users from shared vault ([6b2389c](https://github.com/standardnotes/syncing-server-js/commit/6b2389cdc3da6d522f9ce0ba3ddff3ef1e99674f))

## [1.70.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.70.2...@standardnotes/syncing-server@1.70.3) (2023-07-26)

### Bug Fixes

* **syncing-server:** persisting aggregate changes from root ([#674](https://github.com/standardnotes/syncing-server-js/issues/674)) ([c34f548](https://github.com/standardnotes/syncing-server-js/commit/c34f548e45bbd8defb8d490936e90755fd284e78))

## [1.70.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.70.1...@standardnotes/syncing-server@1.70.2) (2023-07-25)

### Bug Fixes

* **syncing-server:** remove notifications after adding item to vault ([#672](https://github.com/standardnotes/syncing-server-js/issues/672)) ([8f88a87](https://github.com/standardnotes/syncing-server-js/commit/8f88a87c93e21f52a029167f2408ff061e2a4e93))

## [1.70.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.70.0...@standardnotes/syncing-server@1.70.1) (2023-07-25)

### Bug Fixes

* **syncing-server:** allow sender to decline the invite ([#671](https://github.com/standardnotes/syncing-server-js/issues/671)) ([46c4947](https://github.com/standardnotes/syncing-server-js/commit/46c4947871f342f0a07c68562b0e3e77e7e114d4))

# [1.70.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.69.0...@standardnotes/syncing-server@1.70.0) (2023-07-25)

### Features

* **syncing-server:** filtering items by shared vault permissions ([#670](https://github.com/standardnotes/syncing-server-js/issues/670)) ([5f7e768](https://github.com/standardnotes/syncing-server-js/commit/5f7e768e64da0452e6efcf70e36cb5e867291456))

# [1.69.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.68.4...@standardnotes/syncing-server@1.69.0) (2023-07-24)

### Features

* **syncing-server:** determin shared vault operation type ([#669](https://github.com/standardnotes/syncing-server-js/issues/669)) ([71721ab](https://github.com/standardnotes/syncing-server-js/commit/71721ab1982b65feb4c84b44b267a249b573c537))

## [1.68.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.68.3...@standardnotes/syncing-server@1.68.4) (2023-07-24)

### Bug Fixes

* **syncing-server:** force remove shared vault owner when removing shared vault ([f77e29d](https://github.com/standardnotes/syncing-server-js/commit/f77e29d3c9c9a28be3c5624d2c9bf0ffd6348377))

## [1.68.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.68.2...@standardnotes/syncing-server@1.68.3) (2023-07-21)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.68.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.68.1...@standardnotes/syncing-server@1.68.2) (2023-07-21)

### Bug Fixes

* user notifications structure ([#667](https://github.com/standardnotes/syncing-server-js/issues/667)) ([1bbb639](https://github.com/standardnotes/syncing-server-js/commit/1bbb639c83922ec09e3778f85419d76669d36ae3))

## [1.68.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.68.0...@standardnotes/syncing-server@1.68.1) (2023-07-21)

### Bug Fixes

* **syncing-server:** fetching items associated with shared vaults ([#666](https://github.com/standardnotes/syncing-server-js/issues/666)) ([c030a6b](https://github.com/standardnotes/syncing-server-js/commit/c030a6b3d838b1f09593905d28ace65097a3a940))

# [1.68.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.67.1...@standardnotes/syncing-server@1.68.0) (2023-07-20)

### Features

* **syncing-server:** add shared vaults, invites, messages and notifications to sync response ([#665](https://github.com/standardnotes/syncing-server-js/issues/665)) ([efa4d7f](https://github.com/standardnotes/syncing-server-js/commit/efa4d7fc6007ef668e3de3b04853ac11b2d13c30))

## [1.67.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.67.0...@standardnotes/syncing-server@1.67.1) (2023-07-19)

### Bug Fixes

* add missing imports and exports for controllers ([#664](https://github.com/standardnotes/syncing-server-js/issues/664)) ([aee6e60](https://github.com/standardnotes/syncing-server-js/commit/aee6e6058359e2b5231cc13387656f837699300f))

# [1.67.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.66.0...@standardnotes/syncing-server@1.67.0) (2023-07-19)

### Bug Fixes

* **syncing-server:** add missing messages and key system identifier sql representations ([#663](https://github.com/standardnotes/syncing-server-js/issues/663)) ([d026152](https://github.com/standardnotes/syncing-server-js/commit/d026152ac8cb2ecda2eee8d3f7385d655b210938))

### Features

* **syncing-server:** add persistence of shared vaults with users and invites + controllers ([#662](https://github.com/standardnotes/syncing-server-js/issues/662)) ([3f21a35](https://github.com/standardnotes/syncing-server-js/commit/3f21a358d24d70daf541aa62dc86cd9e29500e62))

# [1.66.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.65.0...@standardnotes/syncing-server@1.66.0) (2023-07-18)

### Features

* **syncing-server:** associating existing items with key systems and shared vaults ([#661](https://github.com/standardnotes/syncing-server-js/issues/661)) ([3b804e2](https://github.com/standardnotes/syncing-server-js/commit/3b804e2321f9d8444722f1d336689e12598121ca))

# [1.65.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.64.0...@standardnotes/syncing-server@1.65.0) (2023-07-18)

### Features

* **syncing-server:** persisting shared vault and key system associations ([#660](https://github.com/standardnotes/syncing-server-js/issues/660)) ([479d20e](https://github.com/standardnotes/syncing-server-js/commit/479d20e76f7766006dfa34a0d14401b090dec775))

# [1.64.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.63.1...@standardnotes/syncing-server@1.64.0) (2023-07-17)

### Features

* **syncing-server:** refactor syncing to decouple getting and saving items ([#659](https://github.com/standardnotes/syncing-server-js/issues/659)) ([cb74b23](https://github.com/standardnotes/syncing-server-js/commit/cb74b23e45b207136e299ce8a3db2c04dc87e21e))

## [1.63.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.63.0...@standardnotes/syncing-server@1.63.1) (2023-07-12)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.63.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.62.1...@standardnotes/syncing-server@1.63.0) (2023-07-12)

### Features

* domain items ([#655](https://github.com/standardnotes/syncing-server-js/issues/655)) ([a0af8f0](https://github.com/standardnotes/syncing-server-js/commit/a0af8f00252e1219e58cb7e066c11a8e71692e9d))

## [1.62.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.62.0...@standardnotes/syncing-server@1.62.1) (2023-07-11)

### Bug Fixes

* unify use case usage ([#654](https://github.com/standardnotes/syncing-server-js/issues/654)) ([4d1e2de](https://github.com/standardnotes/syncing-server-js/commit/4d1e2dec264b156a4cfb4980ca3b486433ce64b7))

# [1.62.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.61.0...@standardnotes/syncing-server@1.62.0) (2023-07-10)

### Features

* messages controller. ([#653](https://github.com/standardnotes/syncing-server-js/issues/653)) ([18d07d4](https://github.com/standardnotes/syncing-server-js/commit/18d07d431f08dc17a276f84c0724935d9014a4fd))

# [1.61.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.60.0...@standardnotes/syncing-server@1.61.0) (2023-07-10)

### Features

* message operations use cases. ([#652](https://github.com/standardnotes/syncing-server-js/issues/652)) ([55ec597](https://github.com/standardnotes/syncing-server-js/commit/55ec5970daff9ef51f59e23eca17b312d392542a))

# [1.60.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.59.1...@standardnotes/syncing-server@1.60.0) (2023-07-10)

### Features

* sending messages. ([#651](https://github.com/standardnotes/syncing-server-js/issues/651)) ([ef49b0d](https://github.com/standardnotes/syncing-server-js/commit/ef49b0d3f8ab76dfa63a4c691feb9f35ad65c46f))

## [1.59.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.59.0...@standardnotes/syncing-server@1.59.1) (2023-07-10)

### Bug Fixes

* restructure use cases ([#650](https://github.com/standardnotes/syncing-server-js/issues/650)) ([04d0958](https://github.com/standardnotes/syncing-server-js/commit/04d09582d4c90706a7c7a4601ce011edf6cbc9c2))

# [1.59.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.58.1...@standardnotes/syncing-server@1.59.0) (2023-07-10)

### Features

* user to user message model. ([#649](https://github.com/standardnotes/syncing-server-js/issues/649)) ([f759261](https://github.com/standardnotes/syncing-server-js/commit/f7592619199596f7bef5787dde25efee017c8e60))

## [1.58.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.58.0...@standardnotes/syncing-server@1.58.1) (2023-07-07)

### Bug Fixes

* transfer notifications from auth to syncing-server. ([#648](https://github.com/standardnotes/syncing-server-js/issues/648)) ([c288e5d](https://github.com/standardnotes/syncing-server-js/commit/c288e5d8dc54778a96a9fc33e3c9cae00583fade))

# [1.58.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.57.0...@standardnotes/syncing-server@1.58.0) (2023-07-07)

### Features

* shared vault invites controller and use cases ([#647](https://github.com/standardnotes/syncing-server-js/issues/647)) ([7231013](https://github.com/standardnotes/syncing-server-js/commit/72310130d215047a8097a0c42a7b7dddeb4e3827))

# [1.57.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.56.0...@standardnotes/syncing-server@1.57.0) (2023-07-06)

### Features

* remove inbound shared vault invites. ([#646](https://github.com/standardnotes/syncing-server-js/issues/646)) ([92a5eb0](https://github.com/standardnotes/syncing-server-js/commit/92a5eb0d98486f25b761f37bc5710c45bd95d965))

# [1.56.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.55.0...@standardnotes/syncing-server@1.56.0) (2023-07-06)

### Features

* accept and decline shared vault invites ([#645](https://github.com/standardnotes/syncing-server-js/issues/645)) ([92f96dd](https://github.com/standardnotes/syncing-server-js/commit/92f96ddb84b9b7662899ef187ac38ad2a5769640))

# [1.55.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.54.0...@standardnotes/syncing-server@1.55.0) (2023-07-06)

### Features

* shared vault users controller. ([#643](https://github.com/standardnotes/syncing-server-js/issues/643)) ([b2c32ce](https://github.com/standardnotes/syncing-server-js/commit/b2c32ce70e9020b8d755a65432cb286b624a009c))
* update shared vault invite. ([#644](https://github.com/standardnotes/syncing-server-js/issues/644)) ([912a29d](https://github.com/standardnotes/syncing-server-js/commit/912a29d091ed1ca0af1712cbd09986a1c173a960))

# [1.54.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.53.0...@standardnotes/syncing-server@1.54.0) (2023-07-06)

### Features

* getting shared vault users and removing shared vault user ([#642](https://github.com/standardnotes/syncing-server-js/issues/642)) ([e905128](https://github.com/standardnotes/syncing-server-js/commit/e905128d45eaadb34d3465d4480dfb3a2c5f3f79))

# [1.53.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.52.0...@standardnotes/syncing-server@1.53.0) (2023-07-05)

### Features

* http controllers for shared vaults. ([#641](https://github.com/standardnotes/syncing-server-js/issues/641)) ([7a3946a](https://github.com/standardnotes/syncing-server-js/commit/7a3946a9e2d4168a1d286df321d9972588252b5d))

# [1.52.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.51.0...@standardnotes/syncing-server@1.52.0) (2023-07-05)

### Features

* deleting shared vaults. ([#640](https://github.com/standardnotes/syncing-server-js/issues/640)) ([f3161c2](https://github.com/standardnotes/syncing-server-js/commit/f3161c271296159331639814b2dbb2e566cc54c9))

# [1.51.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.50.0...@standardnotes/syncing-server@1.51.0) (2023-07-05)

### Features

* add getting shared vaults for a user ([#639](https://github.com/standardnotes/syncing-server-js/issues/639)) ([d2b2c33](https://github.com/standardnotes/syncing-server-js/commit/d2b2c339f2089ea5d538ee40118af083983be5ef))

# [1.50.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.49.0...@standardnotes/syncing-server@1.50.0) (2023-07-03)

### Features

* add invite users to a shared vault. ([#636](https://github.com/standardnotes/syncing-server-js/issues/636)) ([5dc5507](https://github.com/standardnotes/syncing-server-js/commit/5dc5507039c0dfb9df82a85377846651fef73c57))

# [1.49.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.48.0...@standardnotes/syncing-server@1.49.0) (2023-07-03)

### Features

* add creating shared vault file valet tokens. ([#635](https://github.com/standardnotes/syncing-server-js/issues/635)) ([04b3bb0](https://github.com/standardnotes/syncing-server-js/commit/04b3bb034fb5bf6f9d00d5b2e8a1abc4832c5417))

# [1.48.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.47.0...@standardnotes/syncing-server@1.48.0) (2023-07-03)

### Features

* add shared vault invite model. ([#634](https://github.com/standardnotes/syncing-server-js/issues/634)) ([890cf48](https://github.com/standardnotes/syncing-server-js/commit/890cf48749b120212080563e6d3070bd43641f1a))

# [1.47.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.46.0...@standardnotes/syncing-server@1.47.0) (2023-06-30)

### Features

* add use case for creating shared vaults and adding users to it. ([#633](https://github.com/standardnotes/syncing-server-js/issues/633)) ([4df8c3b](https://github.com/standardnotes/syncing-server-js/commit/4df8c3b2e5ba4b7d510849ac71b19ed1749f098c))

# [1.46.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.45.0...@standardnotes/syncing-server@1.46.0) (2023-06-30)

### Features

* add shared vaults user model. ([#632](https://github.com/standardnotes/syncing-server-js/issues/632)) ([52f879f](https://github.com/standardnotes/syncing-server-js/commit/52f879f84216084d8affcb3522b1d99cb1135104))

# [1.45.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.44.6...@standardnotes/syncing-server@1.45.0) (2023-06-30)

### Features

* add shared vaults model. ([#631](https://github.com/standardnotes/syncing-server-js/issues/631)) ([38e77f0](https://github.com/standardnotes/syncing-server-js/commit/38e77f04be441b7506c3390fb0d9894b34119c3e))

## [1.44.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.44.5...@standardnotes/syncing-server@1.44.6) (2023-06-30)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.44.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.44.4...@standardnotes/syncing-server@1.44.5) (2023-06-30)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.44.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.44.3...@standardnotes/syncing-server@1.44.4) (2023-06-28)

### Bug Fixes

* add debug logs for invalid-auth responses ([d5a8409](https://github.com/standardnotes/syncing-server-js/commit/d5a8409bb5d35b9caf410a36ea0d5cb747129e8d))

## [1.44.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.44.2...@standardnotes/syncing-server@1.44.3) (2023-06-28)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.44.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.44.1...@standardnotes/syncing-server@1.44.2) (2023-06-22)

### Bug Fixes

* **home-server:** add debug logs about container initalizations ([0df4715](https://github.com/standardnotes/syncing-server-js/commit/0df471585fd5b4626ec2972f3b9a3e33b2830e65))

## [1.44.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.44.0...@standardnotes/syncing-server@1.44.1) (2023-06-14)

### Bug Fixes

* **home-server:** env var determining the sqlite database location ([#626](https://github.com/standardnotes/syncing-server-js/issues/626)) ([0cb5e36](https://github.com/standardnotes/syncing-server-js/commit/0cb5e36b20d9b095ea0edbcd877387e6c0069856))

# [1.44.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.43.0...@standardnotes/syncing-server@1.44.0) (2023-06-07)

### Features

* configurable path for uploads and db ([#623](https://github.com/standardnotes/syncing-server-js/issues/623)) ([af8feaa](https://github.com/standardnotes/syncing-server-js/commit/af8feaadfe2dd58baab4cca217d6307b4a221326))

# [1.43.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.42.2...@standardnotes/syncing-server@1.43.0) (2023-06-05)

### Features

* **home-server:** allow running the home server with a mysql and redis configuration ([#622](https://github.com/standardnotes/syncing-server-js/issues/622)) ([d6e531d](https://github.com/standardnotes/syncing-server-js/commit/d6e531d4b6c1c80a894f6d7ec93632595268dd64))

## [1.42.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.42.1...@standardnotes/syncing-server@1.42.2) (2023-06-02)

### Bug Fixes

* **home-server:** streaming logs ([a8b806a](https://github.com/standardnotes/syncing-server-js/commit/a8b806af084b3e3fe8707ff0cb041a74042ee049))

## [1.42.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.42.0...@standardnotes/syncing-server@1.42.1) (2023-06-02)

### Bug Fixes

* initializing data source with already configured environment ([624b574](https://github.com/standardnotes/syncing-server-js/commit/624b574013157e9e044d4a8ed53cadb7fcc567ae))

# [1.42.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.41.4...@standardnotes/syncing-server@1.42.0) (2023-06-02)

### Features

* **home-server:** add overriding environment variables in underlying services ([#621](https://github.com/standardnotes/syncing-server-js/issues/621)) ([f0cbec0](https://github.com/standardnotes/syncing-server-js/commit/f0cbec07b87d60dfad92072944553f76e0bea164))

## [1.41.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.41.3...@standardnotes/syncing-server@1.41.4) (2023-06-01)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.41.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.41.2...@standardnotes/syncing-server@1.41.3) (2023-06-01)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.41.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.41.1...@standardnotes/syncing-server@1.41.2) (2023-06-01)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.41.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.41.0...@standardnotes/syncing-server@1.41.1) (2023-05-31)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.41.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.40.6...@standardnotes/syncing-server@1.41.0) (2023-05-31)

### Features

* **home-server:** add custom home server logs ([#619](https://github.com/standardnotes/syncing-server-js/issues/619)) ([bc63d0a](https://github.com/standardnotes/syncing-server-js/commit/bc63d0aeea86abbb4a144b2682b7070d7bdfe878))

## [1.40.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.40.5...@standardnotes/syncing-server@1.40.6) (2023-05-31)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.40.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.40.4...@standardnotes/syncing-server@1.40.5) (2023-05-31)

### Reverts

* Revert "Revert "feat: make home server components publishable (#617)"" ([13c85d4](https://github.com/standardnotes/syncing-server-js/commit/13c85d43318caa0fb53726f13ea581ba4a5f816b)), closes [#617](https://github.com/standardnotes/syncing-server-js/issues/617)

## [1.40.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.40.3...@standardnotes/syncing-server@1.40.4) (2023-05-31)

### Bug Fixes

* **home-server:** make the package publishable ([56a312f](https://github.com/standardnotes/syncing-server-js/commit/56a312f21730b32b766c358a5ceb0865722bac46))

## [1.40.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.40.2...@standardnotes/syncing-server@1.40.3) (2023-05-30)

### Reverts

* Revert "feat: make home server components publishable (#617)" ([1a8daef](https://github.com/standardnotes/syncing-server-js/commit/1a8daef79d55a8cdee1632b294b897176af64b26)), closes [#617](https://github.com/standardnotes/syncing-server-js/issues/617)

## [1.40.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.40.0...@standardnotes/syncing-server@1.40.2) (2023-05-30)

### Bug Fixes

* bump version manually to publish packages ([b0d01df](https://github.com/standardnotes/syncing-server-js/commit/b0d01dffd91557c67eac2940d9270bca208c1128))

# [1.40.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.39.0...@standardnotes/syncing-server@1.40.0) (2023-05-30)

### Features

* make home server components publishable ([#617](https://github.com/standardnotes/syncing-server-js/issues/617)) ([55fd873](https://github.com/standardnotes/syncing-server-js/commit/55fd873b375e204dc9b0477b2cc6ed4582e5b603))

# [1.39.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.38.0...@standardnotes/syncing-server@1.39.0) (2023-05-30)

### Features

* upgrade to node 20.2.0 ([#616](https://github.com/standardnotes/syncing-server-js/issues/616)) ([a6b062f](https://github.com/standardnotes/syncing-server-js/commit/a6b062f638595537e1ece28bc79bded41d875e18))

# [1.38.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.37.1...@standardnotes/syncing-server@1.38.0) (2023-05-29)

### Features

* add files server as a service to home-server ([#614](https://github.com/standardnotes/syncing-server-js/issues/614)) ([c7d575a](https://github.com/standardnotes/syncing-server-js/commit/c7d575a0ffc7eb3e8799c3835da5727584f4f67b))

## [1.37.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.37.0...@standardnotes/syncing-server@1.37.1) (2023-05-18)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.37.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.36.0...@standardnotes/syncing-server@1.37.0) (2023-05-17)

### Features

* bundle syncing server into home server setup ([#611](https://github.com/standardnotes/syncing-server-js/issues/611)) ([b3b617e](https://github.com/standardnotes/syncing-server-js/commit/b3b617ea0b4f4574f6aa7cfae0e9fa8f868f1f4c))

# [1.36.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.35.4...@standardnotes/syncing-server@1.36.0) (2023-05-17)

### Features

* **auth:** move inversify express controllers to different structure ([#610](https://github.com/standardnotes/syncing-server-js/issues/610)) ([fea5802](https://github.com/standardnotes/syncing-server-js/commit/fea58029b90804dba31faa3c26dcd7dabe541648))

## [1.35.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.35.3...@standardnotes/syncing-server@1.35.4) (2023-05-17)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.35.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.35.2...@standardnotes/syncing-server@1.35.3) (2023-05-16)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.35.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.35.1...@standardnotes/syncing-server@1.35.2) (2023-05-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.35.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.35.0...@standardnotes/syncing-server@1.35.1) (2023-05-09)

### Bug Fixes

* node engine version requirement in package.json files ([62a0e89](https://github.com/standardnotes/syncing-server-js/commit/62a0e89748ab306566c4aa10b9dc0385fb0f1684))

# [1.35.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.34.2...@standardnotes/syncing-server@1.35.0) (2023-05-08)

### Features

* upgrade to node 20.1.0 ([#590](https://github.com/standardnotes/syncing-server-js/issues/590)) ([8fbb94d](https://github.com/standardnotes/syncing-server-js/commit/8fbb94d15ab664cca775ec71d51db465547c35ee))

## [1.34.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.34.1...@standardnotes/syncing-server@1.34.2) (2023-05-05)

### Bug Fixes

* remove sentry ([c6122d3](https://github.com/standardnotes/syncing-server-js/commit/c6122d33b9ef493758eb2f40837ae0ab90554a67))
* remove unused imports ([990140c](https://github.com/standardnotes/syncing-server-js/commit/990140c3924456ba05d85ef535c953081b217e4b))

## [1.34.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.34.0...@standardnotes/syncing-server@1.34.1) (2023-05-02)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.34.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.33.0...@standardnotes/syncing-server@1.34.0) (2023-04-27)

### Features

* remove cloud backups ([#574](https://github.com/standardnotes/syncing-server-js/issues/574)) ([484f554](https://github.com/standardnotes/syncing-server-js/commit/484f55433928e5c21ee59d8fda94ab3c887cd169))

# [1.33.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.8...@standardnotes/syncing-server@1.33.0) (2023-04-27)

### Features

* add syncing server sqlite driver ([#573](https://github.com/standardnotes/syncing-server-js/issues/573)) ([723ff44](https://github.com/standardnotes/syncing-server-js/commit/723ff441517ec2242d828ba8136a0ad827221868))

## [1.32.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.7...@standardnotes/syncing-server@1.32.8) (2023-04-27)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.32.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.6...@standardnotes/syncing-server@1.32.7) (2023-04-21)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.32.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.5...@standardnotes/syncing-server@1.32.6) (2023-04-21)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.32.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.4...@standardnotes/syncing-server@1.32.5) (2023-03-30)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.32.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.3...@standardnotes/syncing-server@1.32.4) (2023-03-15)

### Bug Fixes

* **syncing-server:** remove unused methods from auth http service ([10a596d](https://github.com/standardnotes/syncing-server-js/commit/10a596db655dc27f4acfef203c38362fb779cc25))

## [1.32.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.2...@standardnotes/syncing-server@1.32.3) (2023-03-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.32.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.1...@standardnotes/syncing-server@1.32.2) (2023-03-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.32.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.32.0...@standardnotes/syncing-server@1.32.1) (2023-03-08)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.32.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.8...@standardnotes/syncing-server@1.32.0) (2023-03-08)

### Features

* sign in setting refactor ([#472](https://github.com/standardnotes/syncing-server-js/issues/472)) ([27cf093](https://github.com/standardnotes/syncing-server-js/commit/27cf093f85d0f2e208f48e7c7ddcce36b341ffb7))

## [1.31.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.7...@standardnotes/syncing-server@1.31.8) (2023-03-01)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.31.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.6...@standardnotes/syncing-server@1.31.7) (2023-02-23)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.31.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.5...@standardnotes/syncing-server@1.31.6) (2023-02-23)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.31.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.4...@standardnotes/syncing-server@1.31.5) (2023-02-22)

### Bug Fixes

* **syncing-server:** numbering of the backup emails ([f7c2984](https://github.com/standardnotes/syncing-server-js/commit/f7c29848f1b1bc8a1f39a5b7f246c52f242ed60a))

## [1.31.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.3...@standardnotes/syncing-server@1.31.4) (2023-02-21)

### Bug Fixes

* **syncing-server:** creating email backup attachment files ([87b22ac](https://github.com/standardnotes/syncing-server-js/commit/87b22ac684732feaf3aef49496b25fbcda5bd888))

## [1.31.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.2...@standardnotes/syncing-server@1.31.3) (2023-02-21)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.31.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.1...@standardnotes/syncing-server@1.31.2) (2023-02-20)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.31.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.31.0...@standardnotes/syncing-server@1.31.1) (2023-02-15)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.31.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.30.2...@standardnotes/syncing-server@1.31.0) (2023-02-15)

### Features

* optimize memory usage ([#444](https://github.com/standardnotes/syncing-server-js/issues/444)) ([fdf4b29](https://github.com/standardnotes/syncing-server-js/commit/fdf4b29ae2717e9b5d1fba2722beb7621a7e5c37))

## [1.30.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.30.1...@standardnotes/syncing-server@1.30.2) (2023-02-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.30.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.30.0...@standardnotes/syncing-server@1.30.1) (2023-02-13)

### Bug Fixes

* **syncing-server:** worker container configuration ([fa0b9bf](https://github.com/standardnotes/syncing-server-js/commit/fa0b9bf9353b78542ca02352cbb59232dadbe8b9))

# [1.30.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.15...@standardnotes/syncing-server@1.30.0) (2023-02-13)

### Features

* **syncing-server:** refactor container config into server and worker ([#443](https://github.com/standardnotes/syncing-server-js/issues/443)) ([993d311](https://github.com/standardnotes/syncing-server-js/commit/993d31167b8b0ac11e3df530d2d1ee566940df6e))

## [1.29.15](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.14...@standardnotes/syncing-server@1.29.15) (2023-02-09)

### Bug Fixes

* optimize memory usage ([e96fd6d](https://github.com/standardnotes/syncing-server-js/commit/e96fd6d69e1252842b5c91b1bedefa36e5d4a232))

## [1.29.14](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.13...@standardnotes/syncing-server@1.29.14) (2023-02-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.13](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.12...@standardnotes/syncing-server@1.29.13) (2023-01-30)

### Bug Fixes

* sqs configuration for aws sdk v3 ([b54c331](https://github.com/standardnotes/syncing-server-js/commit/b54c331bef0d4ad1ba1111700dc9f1bf64c1ea51))

## [1.29.12](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.11...@standardnotes/syncing-server@1.29.12) (2023-01-25)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.10...@standardnotes/syncing-server@1.29.11) (2023-01-24)

### Bug Fixes

* **auth:** add pseudo u2f params on non existing accounts ([e4c65ca](https://github.com/standardnotes/syncing-server-js/commit/e4c65ca631938d8b1d635a40e463d5544051e4a1))

## [1.29.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.9...@standardnotes/syncing-server@1.29.10) (2023-01-24)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.8...@standardnotes/syncing-server@1.29.9) (2023-01-20)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.7...@standardnotes/syncing-server@1.29.8) (2023-01-20)

### Reverts

* Revert "chore: upgrade @standardnotes/* dependencies" ([5bf3ecd](https://github.com/standardnotes/syncing-server-js/commit/5bf3ecdf42e1e5b9cb538cad08a18fb6e4054129))

## [1.29.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.6...@standardnotes/syncing-server@1.29.7) (2023-01-20)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.5...@standardnotes/syncing-server@1.29.6) (2023-01-19)

### Bug Fixes

* strings for role names ([ba7662f](https://github.com/standardnotes/syncing-server-js/commit/ba7662fc1ea24548ab4ea287c5f34d6f27c6c923))

## [1.29.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.4...@standardnotes/syncing-server@1.29.5) (2023-01-19)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.3...@standardnotes/syncing-server@1.29.4) (2023-01-19)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.2...@standardnotes/syncing-server@1.29.3) (2023-01-19)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.1...@standardnotes/syncing-server@1.29.2) (2023-01-19)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.29.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.29.0...@standardnotes/syncing-server@1.29.1) (2023-01-18)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.29.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.10...@standardnotes/syncing-server@1.29.0) (2023-01-18)

### Features

* **syncing-server:** remove saving revisions in syncing-server database in favour of the revisions server ([7c393b1](https://github.com/standardnotes/syncing-server-js/commit/7c393b1125ee9838fd10ae9d3220f1da8790f94f))

## [1.28.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.9...@standardnotes/syncing-server@1.28.10) (2023-01-17)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.28.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.8...@standardnotes/syncing-server@1.28.9) (2023-01-17)

### Bug Fixes

* allow to run typeorm in non-replica mode ([f73129c](https://github.com/standardnotes/syncing-server-js/commit/f73129cd7e7d6a9b8a63e5c80284467597557982))

## [1.28.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.7...@standardnotes/syncing-server@1.28.8) (2023-01-17)

### Bug Fixes

* **syncing-server-js:** add debug logs for dumping items for revisions creation ([8db19c3](https://github.com/standardnotes/syncing-server-js/commit/8db19c3e2b55af9230b92621f01ae0d7c514913a))
* **syncing-server-js:** creating directory for revision dumps ([9b926fb](https://github.com/standardnotes/syncing-server-js/commit/9b926fbad6c40a2e3792cc0d7c54987febd6dced))

## [1.28.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.6...@standardnotes/syncing-server@1.28.7) (2023-01-16)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.28.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.5...@standardnotes/syncing-server@1.28.6) (2023-01-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.28.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.4...@standardnotes/syncing-server@1.28.5) (2023-01-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.28.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.3...@standardnotes/syncing-server@1.28.4) (2023-01-02)

### Bug Fixes

* remove @sentry/profiling-node as it is not compatible with ARM - fixes [#383](https://github.com/standardnotes/syncing-server-js/issues/383) ([fa6d80a](https://github.com/standardnotes/syncing-server-js/commit/fa6d80a753d4999818bb32a7fcb124f23c15f574))
* remove @sentry/profiling-node integration as it is not compatible with ARM - fixes [#383](https://github.com/standardnotes/syncing-server-js/issues/383) ([9c72ad8](https://github.com/standardnotes/syncing-server-js/commit/9c72ad85a04040b3fdfce4f769e5e717ce81a3ce))

## [1.28.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.2...@standardnotes/syncing-server@1.28.3) (2022-12-28)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.28.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.1...@standardnotes/syncing-server@1.28.2) (2022-12-20)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.28.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.28.0...@standardnotes/syncing-server@1.28.1) (2022-12-19)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.28.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.27.0...@standardnotes/syncing-server@1.28.0) (2022-12-19)

### Bug Fixes

* **syncing-server:** cleanup unused events ([f504a82](https://github.com/standardnotes/syncing-server-js/commit/f504a8288c6303101e7dd7fa13f158eec8dfca33))

### Features

* **auth:** add session traces ([8bcb552](https://github.com/standardnotes/syncing-server-js/commit/8bcb552783b2d12f3296b3195752168482790bc8))

# [1.27.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.11...@standardnotes/syncing-server@1.27.0) (2022-12-19)

### Features

* **syncing-server:** setup sentry profiling ([e3b96c3](https://github.com/standardnotes/syncing-server-js/commit/e3b96c3a1f33923e570686c7eef63c106e3bca1b))

## [1.26.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.10...@standardnotes/syncing-server@1.26.11) (2022-12-19)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.26.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.9...@standardnotes/syncing-server@1.26.10) (2022-12-15)

### Bug Fixes

* **syncing-server:** item query created_at condition ([6dcf0ac](https://github.com/standardnotes/syncing-server-js/commit/6dcf0ac124252c441d08a67f2954441ab6266bdf))

## [1.26.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.8...@standardnotes/syncing-server@1.26.9) (2022-12-15)

### Bug Fixes

* **syncing-server:** fetching items in raw mode ([f27aa21](https://github.com/standardnotes/syncing-server-js/commit/f27aa21eb52a73b748e3a555bf201c834fd34aad))

## [1.26.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.7...@standardnotes/syncing-server@1.26.8) (2022-12-15)

### Bug Fixes

* **syncing-server:** select fields in query ([d381161](https://github.com/standardnotes/syncing-server-js/commit/d38116183c9f7b6fb6d13d9076571fef72be555c))

## [1.26.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.6...@standardnotes/syncing-server@1.26.7) (2022-12-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.26.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.5...@standardnotes/syncing-server@1.26.6) (2022-12-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.26.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.4...@standardnotes/syncing-server@1.26.5) (2022-12-15)

### Bug Fixes

* **syncing-server:** revisions processing limit ([f10fa83](https://github.com/standardnotes/syncing-server-js/commit/f10fa839fbe1baec32fd234b41d8cd42fc50931a))

## [1.26.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.3...@standardnotes/syncing-server@1.26.4) (2022-12-15)

### Bug Fixes

* **syncing-server:** user uuid field name ([bfe6f42](https://github.com/standardnotes/syncing-server-js/commit/bfe6f4255a2d3f6e7dfa5eab1509dd770d9bff18))

## [1.26.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.2...@standardnotes/syncing-server@1.26.3) (2022-12-15)

### Bug Fixes

* **syncing-server:** select fields in query for revisions ([ce53c45](https://github.com/standardnotes/syncing-server-js/commit/ce53c459e6ad0d469fcd0ebd7bf4caeb0e1d9c9c))

## [1.26.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.1...@standardnotes/syncing-server@1.26.2) (2022-12-14)

### Bug Fixes

* **syncing-server:** revisions procedure logs ([1e2b496](https://github.com/standardnotes/syncing-server-js/commit/1e2b496f4f87fd49ae8fba8ed9b76d3b6a2c31fa))

## [1.26.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.26.0...@standardnotes/syncing-server@1.26.1) (2022-12-14)

### Bug Fixes

* **syncing-server:** revisions procedure logs ([22fba8b](https://github.com/standardnotes/syncing-server-js/commit/22fba8ba806115b0f4bb4b083ae8595a3f0010b0))

# [1.26.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.25.6...@standardnotes/syncing-server@1.26.0) (2022-12-14)

### Features

* **syncing-server:** change revisions procedure to pagination instead of streaming ([4b1fe3b](https://github.com/standardnotes/syncing-server-js/commit/4b1fe3ba91594858e15cbdfbc21062c428dd03b4))

## [1.25.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.25.5...@standardnotes/syncing-server@1.25.6) (2022-12-14)

### Bug Fixes

* **syncing-server:** additional stream events handling on revisions procedure ([2ec28e5](https://github.com/standardnotes/syncing-server-js/commit/2ec28e541efa2bd9172431d45c5c1560692a912c))

## [1.25.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.25.4...@standardnotes/syncing-server@1.25.5) (2022-12-14)

### Bug Fixes

* **syncing-server:** revisions procedure with env var defined ranges ([9b27547](https://github.com/standardnotes/syncing-server-js/commit/9b27547dae1e5d5e6d071a069803e2bf3f8acdda))

## [1.25.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.25.3...@standardnotes/syncing-server@1.25.4) (2022-12-13)

### Bug Fixes

* **syncing-server:** logs on revisions procedure ([225e0aa](https://github.com/standardnotes/syncing-server-js/commit/225e0aaf88a396bf308c2e5eed0bb6e130cb2d64))

## [1.25.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.25.2...@standardnotes/syncing-server@1.25.3) (2022-12-13)

### Bug Fixes

* **syncing-server:** revisions ownership procedure destructured ([124c443](https://github.com/standardnotes/syncing-server-js/commit/124c4435285c2c2e8d0ce8b47907ebd47af27576))

## [1.25.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.25.1...@standardnotes/syncing-server@1.25.2) (2022-12-13)

### Bug Fixes

* **syncing-server:** change revisions migration to notes ([c419f1c](https://github.com/standardnotes/syncing-server-js/commit/c419f1ce220c27acabfc813a30b3edd6c4aadaa1))

## [1.25.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.25.0...@standardnotes/syncing-server@1.25.1) (2022-12-13)

### Bug Fixes

* **syncing-server:** revisions procedure properties ([cd101b9](https://github.com/standardnotes/syncing-server-js/commit/cd101b96eae8969a4dd2387deb1d4e8679ead216))

# [1.25.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.24.7...@standardnotes/syncing-server@1.25.0) (2022-12-12)

### Features

* **syncing-server:** fix streaming items for revisions update ([a55a995](https://github.com/standardnotes/syncing-server-js/commit/a55a9956602bee7dbb0f93f058aceff7a2136ffd))

## [1.24.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.24.6...@standardnotes/syncing-server@1.24.7) (2022-12-12)

### Bug Fixes

* **syncing-server:** revisions updating - select fields ([4ff8030](https://github.com/standardnotes/syncing-server-js/commit/4ff8030f8709ee18853c2e782cfc5d99c826f074))

## [1.24.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.24.5...@standardnotes/syncing-server@1.24.6) (2022-12-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.24.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.24.4...@standardnotes/syncing-server@1.24.5) (2022-12-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.24.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.24.3...@standardnotes/syncing-server@1.24.4) (2022-12-12)

### Bug Fixes

* **syncing-server:** data integrity check on revisions fix ([6368342](https://github.com/standardnotes/syncing-server-js/commit/6368342149d658898aef62651bfafddf51c26dbe))

## [1.24.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.24.2...@standardnotes/syncing-server@1.24.3) (2022-12-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.24.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.24.1...@standardnotes/syncing-server@1.24.2) (2022-12-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.24.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.24.0...@standardnotes/syncing-server@1.24.1) (2022-12-09)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.24.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.23.0...@standardnotes/syncing-server@1.24.0) (2022-12-09)

### Features

* **syncing-server:** replace email backup attachment created with email requested ([32601f3](https://github.com/standardnotes/syncing-server-js/commit/32601f34f181b29b7c62cd2926111a0887d97fbf))

# [1.23.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.22.0...@standardnotes/syncing-server@1.23.0) (2022-12-09)

### Features

* **syncing-server:** replace one drive backup failed event with email requested ([130f90b](https://github.com/standardnotes/syncing-server-js/commit/130f90bdb6cc88e073b9380e8aed5eebe8c49c1e))

# [1.22.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.21.0...@standardnotes/syncing-server@1.22.0) (2022-12-09)

### Features

* **syncing-serfver:** remove dropbox backup failed event in favour of email requested ([118156c](https://github.com/standardnotes/syncing-server-js/commit/118156c62de70eca8fd89414f6e409abd0363e62))

# [1.21.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.17...@standardnotes/syncing-server@1.21.0) (2022-12-09)

### Features

* **syncing-server:** remove google drive backup failed event in favour of email requested ([00fe321](https://github.com/standardnotes/syncing-server-js/commit/00fe32136e7add627e58e8ea223f7f484f1d3718))

## [1.20.17](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.16...@standardnotes/syncing-server@1.20.17) (2022-12-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.16](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.15...@standardnotes/syncing-server@1.20.16) (2022-12-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.15](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.14...@standardnotes/syncing-server@1.20.15) (2022-12-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.14](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.13...@standardnotes/syncing-server@1.20.14) (2022-12-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.13](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.12...@standardnotes/syncing-server@1.20.13) (2022-12-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.12](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.11...@standardnotes/syncing-server@1.20.12) (2022-12-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.10...@standardnotes/syncing-server@1.20.11) (2022-12-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.9...@standardnotes/syncing-server@1.20.10) (2022-12-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.8...@standardnotes/syncing-server@1.20.9) (2022-12-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.7...@standardnotes/syncing-server@1.20.8) (2022-12-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.6...@standardnotes/syncing-server@1.20.7) (2022-12-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.5...@standardnotes/syncing-server@1.20.6) (2022-12-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.4...@standardnotes/syncing-server@1.20.5) (2022-12-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.3...@standardnotes/syncing-server@1.20.4) (2022-12-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.2...@standardnotes/syncing-server@1.20.3) (2022-12-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.1...@standardnotes/syncing-server@1.20.2) (2022-12-02)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.20.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.20.0...@standardnotes/syncing-server@1.20.1) (2022-12-02)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.20.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.19.1...@standardnotes/syncing-server@1.20.0) (2022-11-30)

### Features

* **syncing-server:** add revisions ownership fix procedure ([6cd68dd](https://github.com/standardnotes/syncing-server-js/commit/6cd68ddd6af0b1adde6c0d1cb3acef6e1aa9811b))

## [1.19.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.19.0...@standardnotes/syncing-server@1.19.1) (2022-11-30)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.19.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.12...@standardnotes/syncing-server@1.19.0) (2022-11-28)

### Features

* **revisions:** add copying revisions on duplicated items ([7bb698e](https://github.com/standardnotes/syncing-server-js/commit/7bb698e44222ef128d9642d625e96b7d26ee4dbf))

## [1.18.12](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.11...@standardnotes/syncing-server@1.18.12) (2022-11-25)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.18.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.10...@standardnotes/syncing-server@1.18.11) (2022-11-24)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.18.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.9...@standardnotes/syncing-server@1.18.10) (2022-11-24)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.18.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.8...@standardnotes/syncing-server@1.18.9) (2022-11-24)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.18.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.7...@standardnotes/syncing-server@1.18.8) (2022-11-24)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.18.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.6...@standardnotes/syncing-server@1.18.7) (2022-11-23)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.18.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.5...@standardnotes/syncing-server@1.18.6) (2022-11-23)

### Bug Fixes

* binding of sns and sqs with additional config ([74bc791](https://github.com/standardnotes/syncing-server-js/commit/74bc79116bc50d9a5af1a558db1b7108dcda6d0e))

## [1.18.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.4...@standardnotes/syncing-server@1.18.5) (2022-11-22)

### Bug Fixes

* **syncing-server:** publish revision creation request only for notes and files ([3086625](https://github.com/standardnotes/syncing-server-js/commit/308662550f7da086a93cb47fd2d0f41cbec14159))

## [1.18.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.3...@standardnotes/syncing-server@1.18.4) (2022-11-22)

### Bug Fixes

* sns binding ([3686a26](https://github.com/standardnotes/syncing-server-js/commit/3686a260192468c00b52087590dd2edf76ada939))

## [1.18.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.2...@standardnotes/syncing-server@1.18.3) (2022-11-22)

### Bug Fixes

* sqs binding ([806a732](https://github.com/standardnotes/syncing-server-js/commit/806a732cbc92cd89deb9d9d2aa95565922ce6b72))

## [1.18.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.1...@standardnotes/syncing-server@1.18.2) (2022-11-22)

### Bug Fixes

* **syncing-server:** bring back creating revisions in syncing server for a transition period ([5f3bd51](https://github.com/standardnotes/syncing-server-js/commit/5f3bd5137f3a22330ea19fefff5f9310e9323044))

## [1.18.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.18.0...@standardnotes/syncing-server@1.18.1) (2022-11-22)

### Bug Fixes

* **syncing-server:** specs ([f7e0b68](https://github.com/standardnotes/syncing-server-js/commit/f7e0b68643df4027d274ed1e575cada62c6dbc25))

# [1.18.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.17.0...@standardnotes/syncing-server@1.18.0) (2022-11-22)

### Features

* **syncing-server:** add dump projection for revisions ([455f35e](https://github.com/standardnotes/syncing-server-js/commit/455f35e0c1ac811720b67592a9017a3470a7740c))

# [1.17.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.16.1...@standardnotes/syncing-server@1.17.0) (2022-11-22)

### Features

* **syncing-server:** add dumping backup items to filesystem ([97b367d](https://github.com/standardnotes/syncing-server-js/commit/97b367d4eee1e8bc2fcfd4a477e6fb1d19507c14))

## [1.16.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.16.0...@standardnotes/syncing-server@1.16.1) (2022-11-22)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.16.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.15.0...@standardnotes/syncing-server@1.16.0) (2022-11-21)

### Features

* **revisions:** add persisting revisions from s3 dump ([822ee89](https://github.com/standardnotes/syncing-server-js/commit/822ee890aff80cd099fc67b778ee02b8e9ef40eb))

# [1.15.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.14.0...@standardnotes/syncing-server@1.15.0) (2022-11-21)

### Features

* **syncing-server:** add creating item dumps for revision service ([8d152dd](https://github.com/standardnotes/syncing-server-js/commit/8d152ddfcb3c88cbbf9df04e3ed6e2c02571d821))

# [1.14.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.17...@standardnotes/syncing-server@1.14.0) (2022-11-21)

### Features

* **syncing-server:** add creating revisions in async way ([1ca8531](https://github.com/standardnotes/syncing-server-js/commit/1ca853130547ebfc26bdd9abce0dfb550e8217f6))

## [1.13.17](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.16...@standardnotes/syncing-server@1.13.17) (2022-11-21)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.13.16](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.15...@standardnotes/syncing-server@1.13.16) (2022-11-18)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.13.15](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.14...@standardnotes/syncing-server@1.13.15) (2022-11-18)

### Bug Fixes

* **syncing-server:** mapper interface imports in specs ([91f36c3](https://github.com/standardnotes/syncing-server-js/commit/91f36c3a3f37e1d53e2203bdfc932fe98cf57b13))

## [1.13.14](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.13...@standardnotes/syncing-server@1.13.14) (2022-11-18)

### Bug Fixes

* mapper interface imports ([1ec0723](https://github.com/standardnotes/syncing-server-js/commit/1ec072373d640c4e2f24b9bb12fec0c678b48032))

## [1.13.13](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.12...@standardnotes/syncing-server@1.13.13) (2022-11-17)

### Bug Fixes

* **syncing-server:** paginating with upper bound limit ([94afa34](https://github.com/standardnotes/syncing-server-js/commit/94afa347807d757b46d507086832fbfb3c73353d))

## [1.13.12](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.11...@standardnotes/syncing-server@1.13.12) (2022-11-16)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.13.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.10...@standardnotes/syncing-server@1.13.11) (2022-11-14)

### Bug Fixes

* **syncing-server:** decrease logs severity for content recalculation ([500756d](https://github.com/standardnotes/syncing-server-js/commit/500756d58239ea4f639362542476827f9faaa88b))

## [1.13.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.9...@standardnotes/syncing-server@1.13.10) (2022-11-14)

### Bug Fixes

* **syncing-server:** linter issues ([3be1bfe](https://github.com/standardnotes/syncing-server-js/commit/3be1bfe58a0dcdda4f593cf5327426cbdcee7c45))

## [1.13.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.8...@standardnotes/syncing-server@1.13.9) (2022-11-14)

### Bug Fixes

* **syncing-server:** retrieving revisions ([50f7ae3](https://github.com/standardnotes/syncing-server-js/commit/50f7ae338ad66d3465fa16c31e7c47c57b1e0c3c))

## [1.13.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.7...@standardnotes/syncing-server@1.13.8) (2022-11-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.13.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.6...@standardnotes/syncing-server@1.13.7) (2022-11-14)

### Bug Fixes

* **syncing-server:** content recalculation missing await ([f766fef](https://github.com/standardnotes/syncing-server-js/commit/f766fefbf0d13a9d37b0598c5c3d228fc376c943))

## [1.13.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.5...@standardnotes/syncing-server@1.13.6) (2022-11-14)

### Bug Fixes

* **syncing-server:** add missing content size recalculation handler binding ([79511ae](https://github.com/standardnotes/syncing-server-js/commit/79511aea5f0fc2114aa7c45851ce4dbe8bc531bb))

## [1.13.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.2...@standardnotes/syncing-server@1.13.5) (2022-11-14)

### Bug Fixes

* versioning issue ([7ca377f](https://github.com/standardnotes/syncing-server-js/commit/7ca377f1b889379e6a43a66c0134bf266763516d))

## [1.13.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.1...@standardnotes/syncing-server@1.13.2) (2022-11-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.13.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.13.0...@standardnotes/syncing-server@1.13.1) (2022-11-14)

### Bug Fixes

* **syncing-server:** add debugs logs for content size recalculation handler ([01a4151](https://github.com/standardnotes/syncing-server-js/commit/01a415176302587986b554783f1f57322d63489d))

# [1.13.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.12.0...@standardnotes/syncing-server@1.13.0) (2022-11-11)

### Features

* **syncing-server:** add content size recalculation job ([7e404ae](https://github.com/standardnotes/syncing-server-js/commit/7e404ae71a46e3251ee9e9abfd6c258ec536c2d3))

# [1.12.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.10...@standardnotes/syncing-server@1.12.0) (2022-11-11)

### Features

* **syncing-server:** add item content size recalculation ([1a13861](https://github.com/standardnotes/syncing-server-js/commit/1a138616478a646d76404c425800937d2049a226))

## [1.11.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.9...@standardnotes/syncing-server@1.11.10) (2022-11-11)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.8...@standardnotes/syncing-server@1.11.9) (2022-11-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.7...@standardnotes/syncing-server@1.11.8) (2022-11-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.6...@standardnotes/syncing-server@1.11.7) (2022-11-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.5...@standardnotes/syncing-server@1.11.6) (2022-11-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.4...@standardnotes/syncing-server@1.11.5) (2022-11-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.3...@standardnotes/syncing-server@1.11.4) (2022-11-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.2...@standardnotes/syncing-server@1.11.3) (2022-11-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.1...@standardnotes/syncing-server@1.11.2) (2022-11-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.11.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.11.0...@standardnotes/syncing-server@1.11.1) (2022-11-09)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.11.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.25...@standardnotes/syncing-server@1.11.0) (2022-11-07)

### Features

* remove analytics scope from other services in favor of a separate service ([ff1d5db](https://github.com/standardnotes/syncing-server-js/commit/ff1d5db12c93f8e51c07c3aecb9fed4be48ea96a))

## [1.10.25](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.24...@standardnotes/syncing-server@1.10.25) (2022-11-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.24](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.23...@standardnotes/syncing-server@1.10.24) (2022-11-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.23](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.22...@standardnotes/syncing-server@1.10.23) (2022-11-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.22](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.21...@standardnotes/syncing-server@1.10.22) (2022-11-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.21](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.20...@standardnotes/syncing-server@1.10.21) (2022-11-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.20](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.19...@standardnotes/syncing-server@1.10.20) (2022-11-04)

### Bug Fixes

* **syncing-server:** event specs ([182512d](https://github.com/standardnotes/syncing-server-js/commit/182512d07c68ae644594404724bf1a0f5e0c71ae))

## [1.10.19](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.18...@standardnotes/syncing-server@1.10.19) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.18](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.17...@standardnotes/syncing-server@1.10.18) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.17](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.16...@standardnotes/syncing-server@1.10.17) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.16](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.15...@standardnotes/syncing-server@1.10.16) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.15](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.14...@standardnotes/syncing-server@1.10.15) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.14](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.13...@standardnotes/syncing-server@1.10.14) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.13](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.12...@standardnotes/syncing-server@1.10.13) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.12](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.11...@standardnotes/syncing-server@1.10.12) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.10...@standardnotes/syncing-server@1.10.11) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.9...@standardnotes/syncing-server@1.10.10) (2022-11-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.8...@standardnotes/syncing-server@1.10.9) (2022-11-03)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.7...@standardnotes/syncing-server@1.10.8) (2022-11-03)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.6...@standardnotes/syncing-server@1.10.7) (2022-11-02)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.5...@standardnotes/syncing-server@1.10.6) (2022-11-02)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.4...@standardnotes/syncing-server@1.10.5) (2022-11-01)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.3...@standardnotes/syncing-server@1.10.4) (2022-11-01)

### Bug Fixes

* force utf8mb4 charset on typeorm ([5160cc3](https://github.com/standardnotes/syncing-server-js/commit/5160cc36ddc9e30551d5ad40a9e210d87091eec3))

## [1.10.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.2...@standardnotes/syncing-server@1.10.3) (2022-10-31)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.1...@standardnotes/syncing-server@1.10.2) (2022-10-31)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.10.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.10.0...@standardnotes/syncing-server@1.10.1) (2022-10-26)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.10.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.8...@standardnotes/syncing-server@1.10.0) (2022-10-19)

### Features

* building server applications in ARM64 architecture for Docker ([fd92866](https://github.com/standardnotes/syncing-server-js/commit/fd92866ba1a86b22769b23cc4c8387a83f87979a))

## [1.9.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.7...@standardnotes/syncing-server@1.9.8) (2022-10-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.9.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.6...@standardnotes/syncing-server@1.9.7) (2022-10-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.9.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.5...@standardnotes/syncing-server@1.9.6) (2022-10-11)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.9.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.4...@standardnotes/syncing-server@1.9.5) (2022-10-11)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.9.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.3...@standardnotes/syncing-server@1.9.4) (2022-10-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.9.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.2...@standardnotes/syncing-server@1.9.3) (2022-10-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.9.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.1...@standardnotes/syncing-server@1.9.2) (2022-10-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.9.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.9.0...@standardnotes/syncing-server@1.9.1) (2022-10-10)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.9.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.21...@standardnotes/syncing-server@1.9.0) (2022-10-07)

### Features

* add user protocol version to the user registration event ([868b7d1](https://github.com/standardnotes/syncing-server-js/commit/868b7d149a572d1991b77daaa37e4c77e10f07d3))

## [1.8.21](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.20...@standardnotes/syncing-server@1.8.21) (2022-10-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.20](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.19...@standardnotes/syncing-server@1.8.20) (2022-10-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.19](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.18...@standardnotes/syncing-server@1.8.19) (2022-10-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.18](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.17...@standardnotes/syncing-server@1.8.18) (2022-10-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.17](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.16...@standardnotes/syncing-server@1.8.17) (2022-10-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.16](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.15...@standardnotes/syncing-server@1.8.16) (2022-10-03)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.15](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.14...@standardnotes/syncing-server@1.8.15) (2022-09-30)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.14](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.13...@standardnotes/syncing-server@1.8.14) (2022-09-30)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.13](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.12...@standardnotes/syncing-server@1.8.13) (2022-09-30)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.12](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.11...@standardnotes/syncing-server@1.8.12) (2022-09-30)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.10...@standardnotes/syncing-server@1.8.11) (2022-09-28)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.9...@standardnotes/syncing-server@1.8.10) (2022-09-22)

### Bug Fixes

* **syncing-server-js:** binding of sync limit ([5628de6](https://github.com/standardnotes/syncing-server-js/commit/5628de6445a90901735b449488fb8c8374f2171e))

## [1.8.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.8...@standardnotes/syncing-server@1.8.9) (2022-09-22)

### Bug Fixes

* **syncing-server:** introduce upper bound for sync items limit as an env var ([03d1bc6](https://github.com/standardnotes/syncing-server-js/commit/03d1bc611c39c0d1f0bcaa00824825304e08d30b))

## [1.8.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.7...@standardnotes/syncing-server@1.8.8) (2022-09-21)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.6...@standardnotes/syncing-server@1.8.7) (2022-09-20)

### Bug Fixes

* **syncing-server:** content size calculation and add syncing upper bound for limit paramter ([c2e9f3e](https://github.com/standardnotes/syncing-server-js/commit/c2e9f3e72b87c445a6f4d61cbf59621954187d21))

## [1.8.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.5...@standardnotes/syncing-server@1.8.6) (2022-09-19)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.4...@standardnotes/syncing-server@1.8.5) (2022-09-16)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.3...@standardnotes/syncing-server@1.8.4) (2022-09-16)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.2...@standardnotes/syncing-server@1.8.3) (2022-09-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.8.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.1...@standardnotes/syncing-server@1.8.2) (2022-09-15)

### Bug Fixes

* **syncing-server:** files count stats ([ecdfe9e](https://github.com/standardnotes/syncing-server-js/commit/ecdfe9ecc0bce882c1e3c6984f67b76862d76836))

## [1.8.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.8.0...@standardnotes/syncing-server@1.8.1) (2022-09-09)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.8.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.7.1...@standardnotes/syncing-server@1.8.0) (2022-09-09)

### Features

* **syncing-server:** add tracking files count in stats ([52cc646](https://github.com/standardnotes/syncing-server-js/commit/52cc6462a66dae3bd6c05f551d4ba661c8a9b8c8))

## [1.7.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.7.0...@standardnotes/syncing-server@1.7.1) (2022-09-09)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.7.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.70...@standardnotes/syncing-server@1.7.0) (2022-09-09)

### Features

* **syncing-server:** add statistics for notes count for free and paid users ([c9ec7b4](https://github.com/standardnotes/syncing-server-js/commit/c9ec7b492aea1911e441ed8ad9a155f871be2ef7))

## [1.6.70](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.69...@standardnotes/syncing-server@1.6.70) (2022-09-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.69](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.68...@standardnotes/syncing-server@1.6.69) (2022-09-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.68](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.67...@standardnotes/syncing-server@1.6.68) (2022-09-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.67](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.66...@standardnotes/syncing-server@1.6.67) (2022-09-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.66](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.65...@standardnotes/syncing-server@1.6.66) (2022-09-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.65](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.64...@standardnotes/syncing-server@1.6.65) (2022-09-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.64](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.63...@standardnotes/syncing-server@1.6.64) (2022-09-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.63](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.62...@standardnotes/syncing-server@1.6.63) (2022-09-07)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.62](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.61...@standardnotes/syncing-server@1.6.62) (2022-09-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.61](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.60...@standardnotes/syncing-server@1.6.61) (2022-09-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.60](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.59...@standardnotes/syncing-server@1.6.60) (2022-09-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.59](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.58...@standardnotes/syncing-server@1.6.59) (2022-09-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.58](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.57...@standardnotes/syncing-server@1.6.58) (2022-09-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.57](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.56...@standardnotes/syncing-server@1.6.57) (2022-09-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.56](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.55...@standardnotes/syncing-server@1.6.56) (2022-09-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.55](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.54...@standardnotes/syncing-server@1.6.55) (2022-09-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.54](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.53...@standardnotes/syncing-server@1.6.54) (2022-09-05)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.53](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.52...@standardnotes/syncing-server@1.6.53) (2022-09-01)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.52](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.51...@standardnotes/syncing-server@1.6.52) (2022-09-01)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.51](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.50...@standardnotes/syncing-server@1.6.51) (2022-08-30)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.50](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.49...@standardnotes/syncing-server@1.6.50) (2022-08-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.49](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.48...@standardnotes/syncing-server@1.6.49) (2022-08-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.48](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.47...@standardnotes/syncing-server@1.6.48) (2022-08-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.47](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.46...@standardnotes/syncing-server@1.6.47) (2022-08-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.46](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.45...@standardnotes/syncing-server@1.6.46) (2022-08-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.45](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.44...@standardnotes/syncing-server@1.6.45) (2022-08-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.44](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.43...@standardnotes/syncing-server@1.6.44) (2022-08-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.43](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.42...@standardnotes/syncing-server@1.6.43) (2022-08-11)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.42](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.41...@standardnotes/syncing-server@1.6.42) (2022-08-10)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.41](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.40...@standardnotes/syncing-server@1.6.41) (2022-08-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.40](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.39...@standardnotes/syncing-server@1.6.40) (2022-08-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.39](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.38...@standardnotes/syncing-server@1.6.39) (2022-08-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.38](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.37...@standardnotes/syncing-server@1.6.38) (2022-08-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.37](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.36...@standardnotes/syncing-server@1.6.37) (2022-08-09)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.36](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.35...@standardnotes/syncing-server@1.6.36) (2022-08-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.35](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.34...@standardnotes/syncing-server@1.6.35) (2022-08-08)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.34](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.33...@standardnotes/syncing-server@1.6.34) (2022-07-29)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.33](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.32...@standardnotes/syncing-server@1.6.33) (2022-07-29)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.32](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.31...@standardnotes/syncing-server@1.6.32) (2022-07-27)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.31](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.30...@standardnotes/syncing-server@1.6.31) (2022-07-27)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.30](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.29...@standardnotes/syncing-server@1.6.30) (2022-07-26)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.29](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.28...@standardnotes/syncing-server@1.6.29) (2022-07-25)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.28](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.27...@standardnotes/syncing-server@1.6.28) (2022-07-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.27](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.26...@standardnotes/syncing-server@1.6.27) (2022-07-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.26](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.25...@standardnotes/syncing-server@1.6.26) (2022-07-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.25](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.24...@standardnotes/syncing-server@1.6.25) (2022-07-15)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.24](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.23...@standardnotes/syncing-server@1.6.24) (2022-07-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.23](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.22...@standardnotes/syncing-server@1.6.23) (2022-07-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.22](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.21...@standardnotes/syncing-server@1.6.22) (2022-07-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.21](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.20...@standardnotes/syncing-server@1.6.21) (2022-07-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.20](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.19...@standardnotes/syncing-server@1.6.20) (2022-07-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.19](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.18...@standardnotes/syncing-server@1.6.19) (2022-07-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.18](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.17...@standardnotes/syncing-server@1.6.18) (2022-07-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.17](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.16...@standardnotes/syncing-server@1.6.17) (2022-07-14)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.16](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.15...@standardnotes/syncing-server@1.6.16) (2022-07-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.15](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.14...@standardnotes/syncing-server@1.6.15) (2022-07-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.14](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.13...@standardnotes/syncing-server@1.6.14) (2022-07-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.13](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.12...@standardnotes/syncing-server@1.6.13) (2022-07-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.12](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.11...@standardnotes/syncing-server@1.6.12) (2022-07-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.10...@standardnotes/syncing-server@1.6.11) (2022-07-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.9...@standardnotes/syncing-server@1.6.10) (2022-07-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.8...@standardnotes/syncing-server@1.6.9) (2022-07-13)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.7...@standardnotes/syncing-server@1.6.8) (2022-07-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.6...@standardnotes/syncing-server@1.6.7) (2022-07-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.5...@standardnotes/syncing-server@1.6.6) (2022-07-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.4...@standardnotes/syncing-server@1.6.5) (2022-07-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.3...@standardnotes/syncing-server@1.6.4) (2022-07-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.2...@standardnotes/syncing-server@1.6.3) (2022-07-12)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.6.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.1...@standardnotes/syncing-server@1.6.2) (2022-07-11)

### Bug Fixes

* log errors on not being able to create a backup file ([fc5cea1](https://github.com/standardnotes/syncing-server-js/commit/fc5cea11b5401f83a0f8cf2b386abbff90bd18d7))

## [1.6.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.6.0...@standardnotes/syncing-server@1.6.1) (2022-07-11)

### Bug Fixes

* remove unused MailBackupAttachmentTooBigEvent ([b4fae4b](https://github.com/standardnotes/syncing-server-js/commit/b4fae4b800fdef9bcfb28d8f332c5c0bbf576833))

# [1.6.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.5.0...@standardnotes/syncing-server@1.6.0) (2022-07-06)

### Features

* add settings package ([e7e34f3](https://github.com/standardnotes/syncing-server-js/commit/e7e34f3e16eb865f083b7b49b2f8f83fd8af8de0))

# [1.5.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.4.0...@standardnotes/syncing-server@1.5.0) (2022-07-06)

### Features

* add common package ([fd4ee21](https://github.com/standardnotes/syncing-server-js/commit/fd4ee2123dc72b4d8755504d57bced608c1ab928))

# [1.4.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.3.0...@standardnotes/syncing-server@1.4.0) (2022-07-06)

### Features

* add time package ([565e890](https://github.com/standardnotes/syncing-server-js/commit/565e890973b1d96544bb750fdd700d58f8dad088))

# [1.3.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.2.2...@standardnotes/syncing-server@1.3.0) (2022-07-06)

### Bug Fixes

* deps to @standarnotes/security ([699164e](https://github.com/standardnotes/syncing-server-js/commit/699164eba553cd07fb50f7a06ae8991028167603))

### Features

* add security package ([d86928f](https://github.com/standardnotes/syncing-server-js/commit/d86928f1b4b5feda8c330ed8ee0bf9de0fc12ae7))

## [1.2.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.2.1...@standardnotes/syncing-server@1.2.2) (2022-07-06)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.2.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.2.0...@standardnotes/syncing-server@1.2.1) (2022-07-06)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.2.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.11...@standardnotes/syncing-server@1.2.0) (2022-07-06)

### Features

* add analytics package ([14e4ca7](https://github.com/standardnotes/syncing-server-js/commit/14e4ca70b438dd3eaaa404bc0ca31d22a62b45be))

## [1.1.11](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.10...@standardnotes/syncing-server@1.1.11) (2022-07-06)

### Bug Fixes

* testing project packages ([d818799](https://github.com/standardnotes/syncing-server-js/commit/d818799418d3681c60ba1758b9d5dda945aed5a7))

## [1.1.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.9...@standardnotes/syncing-server@1.1.10) (2022-07-06)

### Bug Fixes

* publishing setup ([caaad92](https://github.com/standardnotes/syncing-server-js/commit/caaad9205cbf5e7fcec8d703d6257c3e616133e4))

## [1.1.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.8...@standardnotes/syncing-server@1.1.9) (2022-07-04)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.1.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.7...@standardnotes/syncing-server@1.1.8) (2022-06-28)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.1.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.6...@standardnotes/syncing-server@1.1.7) (2022-06-27)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.1.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.5...@standardnotes/syncing-server@1.1.6) (2022-06-27)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.1.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.4...@standardnotes/syncing-server@1.1.5) (2022-06-27)

### Bug Fixes

* upgrade sentry node sdk ([b6db194](https://github.com/standardnotes/syncing-server-js/commit/b6db194a22ff1d0afe96c291d545b408c0a5c373))

## [1.1.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.3...@standardnotes/syncing-server@1.1.4) (2022-06-24)

### Bug Fixes

* newrelic deps and setup db and cache for local development purposes ([ff09ae0](https://github.com/standardnotes/syncing-server-js/commit/ff09ae0a47747eaf7977ce5d3937ad385101eaeb))

## [1.1.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.2...@standardnotes/syncing-server@1.1.3) (2022-06-23)

### Bug Fixes

* curl in the final image ([0d67c55](https://github.com/standardnotes/syncing-server-js/commit/0d67c55e124eed08bca16824750152b895fceca7))

## [1.1.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.1...@standardnotes/syncing-server@1.1.2) (2022-06-23)

**Note:** Version bump only for package @standardnotes/syncing-server

## [1.1.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0...@standardnotes/syncing-server@1.1.1) (2022-06-23)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.1.0](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.10...@standardnotes/syncing-server@1.1.0) (2022-06-23)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.1.0-alpha.10](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.9...@standardnotes/syncing-server@1.1.0-alpha.10) (2022-06-23)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.1.0-alpha.9](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.8...@standardnotes/syncing-server@1.1.0-alpha.9) (2022-06-23)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.1.0-alpha.8](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.7...@standardnotes/syncing-server@1.1.0-alpha.8) (2022-06-23)

### Bug Fixes

* add missing curl to docker image for healthcheck purposes ([7efb48d](https://github.com/standardnotes/syncing-server-js/commit/7efb48dd2a6066c29601d34bfcbfe6231f644c50))

# [1.1.0-alpha.7](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.6...@standardnotes/syncing-server@1.1.0-alpha.7) (2022-06-23)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.1.0-alpha.6](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.5...@standardnotes/syncing-server@1.1.0-alpha.6) (2022-06-23)

### Bug Fixes

* upgrade time lib for syncing-server ([6c87d36](https://github.com/standardnotes/syncing-server-js/commit/6c87d3614dfb77f6d1cb02d3d4c1884f2164693f))

# [1.1.0-alpha.5](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.4...@standardnotes/syncing-server@1.1.0-alpha.5) (2022-06-23)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.1.0-alpha.4](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.3...@standardnotes/syncing-server@1.1.0-alpha.4) (2022-06-23)

### Features

* add api-gateway package ([57c3b9c](https://github.com/standardnotes/syncing-server-js/commit/57c3b9c29e5b16449c864e59dbc1fd11689125f9))

# [1.1.0-alpha.3](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.2...@standardnotes/syncing-server@1.1.0-alpha.3) (2022-06-22)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.1.0-alpha.2](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.1...@standardnotes/syncing-server@1.1.0-alpha.2) (2022-06-22)

**Note:** Version bump only for package @standardnotes/syncing-server

# [1.1.0-alpha.1](https://github.com/standardnotes/syncing-server-js/compare/@standardnotes/syncing-server@1.1.0-alpha.0...@standardnotes/syncing-server@1.1.0-alpha.1) (2022-06-22)

### Bug Fixes

* bump @standardnotes/time dependency ([f2ddbc8](https://github.com/standardnotes/syncing-server-js/commit/f2ddbc82d074ea5e2e30ec73de3839102549751c))

# 1.1.0-alpha.0 (2022-06-22)

### Features

* add syncing-server package ([6cc4ef9](https://github.com/standardnotes/syncing-server-js/commit/6cc4ef90db9e79d53f9646311d234432ef4cf1e3))
