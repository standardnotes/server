'use strict'

const path = require('path')

const pnp = require(path.normalize(path.resolve(__dirname, '../../..', '.pnp.cjs'))).setup()

const index = require(path.normalize(path.resolve(__dirname, '../dist/bin/worker.js')))

Object.defineProperty(exports, '__esModule', { value: true })

exports.default = index
