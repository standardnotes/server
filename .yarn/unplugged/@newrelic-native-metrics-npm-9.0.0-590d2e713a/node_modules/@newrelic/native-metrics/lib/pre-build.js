/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This file is largely based upon the work done for node-pre-gyp. We are not
// using that module directly due to issues we've run into with the intricacies
// of various node and npm versions that we must support.
// https://www.npmjs.com/package/node-pre-gyp

// XXX This file must not have any deps. This file will run during the install
// XXX step of the module and we are _not_ guaranteed that the dependencies have
// XXX already installed. Core modules are okay.
const cp = require('child_process')
const fs = require('fs')
const http = require('http')
const https = require('https')
const os = require('os')
const path = require('path')
const semver = require('semver')
const zlib = require('zlib')
const ProxyAgent = require('https-proxy-agent')

const {
  getBinFileName,
  getPackageFileName,
  parseArgs,
  logStart,
  logFinish,
  PACKAGE_ROOT,
  BUILD_PATH,
  REMOTE_PATH
} = require('./common')

const CPU_COUNT = os.cpus().length
const IS_WIN = process.platform === 'win32'
const DOWNLOAD_HOST =
  process.env.NR_NATIVE_METRICS_DOWNLOAD_HOST || 'https://download.newrelic.com/'

const opts = {}
exports.load = load
exports.executeCli = executeCli

if (require.main === module) {
  const [, , cmd, target] = parseArgs(process.argv, opts)
  executeCli(cmd, target)
}

function load(target) {
  return require(path.join(BUILD_PATH, getBinFileName(target)))
}

function makePath(pathToMake, cb) {
  const accessRights = fs.constants.R_OK | fs.constants.W_OK

  // We only want to make the parts after the package directory.
  pathToMake = path.relative(PACKAGE_ROOT, pathToMake)

  // Now that we have a relative path, split it into the parts we need to make.
  const pathParts = pathToMake.split(path.sep)
  _make(-1, PACKAGE_ROOT)

  function _make(i, p) {
    if (++i >= pathParts.length) {
      return cb()
    }
    p = path.join(p, pathParts[i])

    fs.access(p, accessRights, function fsAccessCB(err) {
      if (!err) {
        // It exists and we have read+write access! Move on to the next part.
        return _make(i, p)
      } else if (err.code !== 'ENOENT') {
        // It exists but we don't have read+write access! This is a problem.
        return cb(new Error('Do not have access to "' + p + '": ' + err))
      }

      // It probably does not exist, so try to make it.
      fs.mkdir(p, function fsMkDirCB(mkdirErr) {
        if (mkdirErr) {
          return cb(mkdirErr)
        }
        _make(i, p)
      })
    })
  }
}

function findNodeGyp() {
  // This code heavily borrows from node-pre-gyp.
  // https://github.com/mapbox/node-pre-gyp/blob/e0b3b6/lib/util/compile.js#L18-L55

  // First, look for it in the NPM environment variable.
  let gypPath = null
  if (process.env.npm_config_node_gyp) {
    try {
      gypPath = process.env.npm_config_node_gyp
      fs.accessSync(gypPath)
      return gypPath
    } catch (err) {
      // This method failed, hopefully the next will succeed...
    }
  }

  // Next, see if the package is installed somewhere.
  try {
    // eslint-disable-next-line node/no-missing-require
    const gypPkgPath = require.resolve('node-gyp')
    gypPath = path.resolve(gypPkgPath, '../../bin/node-gyp.js')
    fs.accessSync(gypPath)
    return gypPath
  } catch (err) {
    // This method failed, hopefully the next will succeed...
  }

  // Then look for it in NPM's install location.
  try {
    // eslint-disable-next-line node/no-missing-require
    const npmPkgPath = require.resolve('npm')
    gypPath = path.resolve(npmPkgPath, '../../node_modules/node-gyp/bin/node-gyp.js')
    fs.accessSync(gypPath)
    return gypPath
  } catch (err) {
    // This method failed, hopefully the next will succeed...
  }

  // All of that failed, now look for it next to node itself.
  const nodeNpmPkgPath = path.resolve(process.execPath, '../../lib/node_modules/npm/')
  gypPath = path.join(nodeNpmPkgPath, 'node_modules/node-gyp/bin/node-gyp.js')
  try {
    fs.accessSync(gypPath)
    return gypPath
  } catch {
    return null
  }
}

function gypVersion() {
  let cmd = null
  const args = ['-v']
  const gyp = findNodeGyp()
  if (gyp) {
    args.unshift(gyp) // push_front
    cmd = process.execPath
  } else {
    cmd = IS_WIN ? 'node-gyp.cmd' : 'node-gyp'
  }

  const child = cp.spawnSync(cmd, args)
  const match = /v(\d+\.\d+\.\d+)/.exec(child.stdout)
  return match && match[1]
}

function execGyp(args, cb) {
  let cmd = null
  const gyp = findNodeGyp()
  if (gyp) {
    args.unshift(gyp) // push_front
    cmd = process.execPath
  } else {
    cmd = IS_WIN ? 'node-gyp.cmd' : 'node-gyp'
  }

  const spawnOpts = {}
  if (!opts.quiet) {
    spawnOpts.stdio = [0, 1, 2]
  }
  console.log('> ' + cmd + ' ' + args.join(' ')) // eslint-disable-line no-console

  const child = cp.spawn(cmd, args, spawnOpts)
  child.on('error', cb)
  child.on('close', function onGypClose(code) {
    if (code !== 0) {
      cb(new Error('Command exited with non-zero code: ' + code))
    } else {
      cb(null)
    }
  })
}

function build(target, rebuild, cb) {
  const HAS_OLD_NODE_GYP_ARGS_FOR_WINDOWS = semver.lt(gypVersion() || '0.0.0', '3.7.0')

  if (IS_WIN && HAS_OLD_NODE_GYP_ARGS_FOR_WINDOWS) {
    target = '/t:' + target
  }

  const cmds = rebuild ? ['clean', 'configure'] : ['configure']

  execGyp(cmds, function cleanCb(err) {
    if (err) {
      return cb(err)
    }

    const jobs = Math.round(CPU_COUNT / 2)
    execGyp(['build', '-j', jobs, target], cb)
  })
}

function moveBuild(target, cb) {
  const filePath = path.join(BUILD_PATH, target + '.node')
  const destination = path.join(BUILD_PATH, getBinFileName(target))
  fs.rename(filePath, destination, cb)
}

function download(target, cb) {
  /* eslint-disable no-console */
  const fileName = getPackageFileName(target)
  const url = DOWNLOAD_HOST + REMOTE_PATH + fileName
  let client = null
  let hasCalledBack = false
  let options = {}
  const proxyHost = process.env.NR_NATIVE_METRICS_PROXY_HOST

  if (proxyHost) {
    const parsedUrl = new URL(DOWNLOAD_HOST)
    options = parsedUrl
    options.path = REMOTE_PATH + fileName
    options.agent = new ProxyAgent(proxyHost)
    client = /^https:/.test(proxyHost) ? https : http
  } else {
    options = url
    if (DOWNLOAD_HOST.startsWith('https:')) {
      client = https
    } else {
      console.log('Falling back to http, please consider enabling SSL on ' + DOWNLOAD_HOST)
      client = http
    }
  }

  client.get(options, function getFile(res) {
    if (res.statusCode === 404) {
      return cb(new Error('No pre-built artifacts to download for your OS/architecture.'))
    } else if (res.statusCode !== 200) {
      return cb(new Error('Failed to download ' + url + ': code ' + res.statusCode))
    }

    const unzip = zlib.createGunzip()
    const buffers = []
    let size = 0
    res.pipe(unzip).on('data', function onResData(data) {
      buffers.push(data)
      size += data.length
    })

    res.on('error', function onResError(err) {
      if (!hasCalledBack) {
        hasCalledBack = true
        cb(new Error('Failed to download ' + url + ': ' + err.message))
      }
    })

    unzip.on('error', function onResError(err) {
      if (!hasCalledBack) {
        hasCalledBack = true
        cb(new Error('Failed to unzip ' + url + ': ' + err.message))
      }
    })

    unzip.on('end', function onResEnd() {
      if (hasCalledBack) {
        return
      }
      hasCalledBack = true
      cb(null, Buffer.concat(buffers, size))
    })

    res.resume()
  })
  /* eslint-enable no-console */
}

function saveDownload(target, data, cb) {
  makePath(BUILD_PATH, function makePathCB(err) {
    if (err) {
      return cb(err)
    }

    const filePath = path.join(BUILD_PATH, getBinFileName(target))
    fs.writeFile(filePath, data, cb)
  })
}

function install(target, cb) {
  const errors = []

  const noBuild = opts['no-build'] || process.env.NR_NATIVE_METRICS_NO_BUILD
  const noDownload = opts['no-download'] || process.env.NR_NATIVE_METRICS_NO_DOWNLOAD

  // If NR_NATIVE_METRICS_NO_BUILD env var is specified, jump straight to downloading
  if (noBuild) {
    return doDownload()
  }

  // Otherwise, first attempt to build the package using the source. If that fails, try
  // downloading the package. If that also fails, whoops!
  build(target, true, function buildCB(buildErr) {
    if (!buildErr) {
      return moveBuild(target, function moveBuildCB(moveErr) {
        if (moveErr) {
          errors.push(moveErr)
          doDownload()
        } else {
          doCallback()
        }
      })
    }
    errors.push(buildErr)

    // Building failed, try downloading.
    doDownload()
  })

  function doDownload() {
    if (noDownload && !noBuild) {
      return doCallback(new Error('Downloading is disabled.'))
    }

    download(target, function downloadCB(err, data) {
      if (err) {
        return doCallback(err)
      }

      saveDownload(target, data, doCallback)
    })
  }

  function doCallback(err) {
    if (err) {
      errors.push(err)
      cb(err)
    } else {
      cb()
    }
  }
}

function executeCli(cmd, target) {
  logStart(cmd)
  if (cmd === 'build' || cmd === 'rebuild') {
    build(target, cmd === 'rebuild', function buildCb(err) {
      if (err) {
        logFinish(cmd, target, err)
      } else {
        moveBuild(target, logFinish.bind(this, cmd, target))
      }
    })
  } else if (cmd === 'install') {
    install(target, logFinish.bind(this, cmd, target))
  }
}
