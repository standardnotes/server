/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const path = require('path')
const common = module.exports

common.PACKAGE_ROOT = path.resolve(__dirname, '..')
common.BUILD_PATH = path.resolve(common.PACKAGE_ROOT, './build/Release')
common.REMOTE_PATH = process.env.NR_NATIVE_METRICS_REMOTE_PATH || 'nodejs_agent/builds/'

common.parseArgs = function parseArgs(_argv, _opts) {
  const args = []
  for (let i = 0; i < _argv.length; ++i) {
    if (/^--/.test(_argv[i])) {
      _opts[_argv[i].substr(2)] = true
    } else {
      args.push(_argv[i])
    }
  }
  return args
}

common.logStart = function logStart(cmd) {
  /* eslint-disable no-console */
  console.log(
    [
      '============================================================================',
      `Attempting ${cmd} in native-metrics module. Please note that this is an`,
      'OPTIONAL dependency, and any resultant errors in this process will not',
      'affect the general performance of the New Relic agent, but event loop and',
      'garbage collection metrics will not be collected for the Node VMs page.',
      '============================================================================',
      ''
    ].join('\n')
    /* eslint-enable no-console */
  )
}

common.logFinish = function logFinish(cmd, target, err) {
  /* eslint-disable no-console */
  if (err) {
    console.error(`Failed to execute native-metrics ${cmd}: ${err.message}\n`)

    console.error(
      [
        'Failed install of this OPTIONAL dependency will not impact the general performance',
        'of the New Relic Node.js agent. You may safely run in production. Your application',
        'will be missing event loop and garbage collection metrics for the Node VMs page.',
        'To capture Node event loop and GC metrics, please resolve issues and reinstall.'
      ].join('\n')
    )

    // eslint-disable-next-line no-process-exit
    process.exit(1)
  } else {
    console.log(cmd + ' successful: ' + common.getFileName(target))
  }
  /* eslint-enable no-console */
}

common.getFileName = function getFileName(target) {
  const abi = process.versions.modules
  const arch = process.arch
  const platform = process.platform
  const pkg = require('../package')
  const pkgName = pkg.name.replace(/[^\w]/g, '_')
  const pkgVersion = pkg.version.toString().replace(/[^\w]/g, '_')

  if (!abi || !arch || !target || !platform || !pkg || !pkgName || !pkgVersion) {
    throw new Error('Missing information for naming compiled binary.')
  }

  /**
   * Electron forks Node and has its own custom ABI versions. Because of this,
   * the ABI version.included in the binary filename causes issues related to
   * mismatched Node versions. A quick + temporary fix for this is to strip out
   * the ABI name for suspected Electron builds. Tools such as `electron-builder`
   * and `electron-rebuild` will include environment variables to work with
   * node-gyp. We can look at those env vars to see if they have been patched
   * to contain the word 'electron'.
   * For more context: https://github.com/newrelic/node-native-metrics/pull/75
   * It's worth pointing out that this is a patch and not a solution as this will
   * have other (minor) repercussions
   */
  if (
    (process.env.npm_config_runtime || '').includes('electron') ||
    (process.env.npm_config_disturl || '').includes('electron')
  ) {
    return [pkgName, pkgVersion, target, platform, arch].join('-')
  }

  return [pkgName, pkgVersion, target, abi, platform, arch].join('-')
}

common.getPackageFileName = function getPackageFileName(target) {
  return common.getFileName(target) + '.gz'
}

common.getBinFileName = function getBinFileName(target) {
  return common.getFileName(target) + '.node'
}
