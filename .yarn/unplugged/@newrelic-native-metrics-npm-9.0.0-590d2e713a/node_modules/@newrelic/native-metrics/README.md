[![Community Plus header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Plus.png)](https://opensource.newrelic.com/oss-category/#community-plus)

# Native Metrics for New Relic Node.js Agent [![native-metrics CI][ci-badge]][ci-link]

This module provides hooks into the native layer of Node.js to provide metrics for
the [New Relic Node.js Agent][npm-newrelic]. It gathers information that isn't
available at the JS layer about the V8 virtual machine and the process health.
It comes packaged with the New Relic Agent since v2, and there is nothing that
needs to be done. For Agent v1 you need only to install the module alongside
[`newrelic`][npm-newrelic].

## Installation and Getting Started

Typically, most users use the version auto-installed by the agent.

In some cases, installing a specific version is ideal. For example, new features or major changes might be released via a major version update to this module, prior to inclusion in the main New Relic Node.js agent.

```
$ npm install --save @newrelic/native-metrics
```

Note that this is a native module and thus must be compiled to function.
Pre-built binaries are provided for Linux servers running supported versions of
Node. If you are not using Linux or not using a supported version of Node, you
will need to have a compiler installed on the machine where this is to be
deployed. See [node-gyp](https://www.npmjs.com/package/node-gyp#installation)
for more information on compiling native addons.

If you prepare and package deployments on one machine and install them on
another, the two machines must have the same operating system and architecture.
If they are not, you will need to re-build the native module after deploying in
order to get the correct binaries.

During installation, the module will first attempt build from source on the
target machine. If that fails, it will attempt to download a pre-built binary
for your system. You can disable the download attempt by setting
`NR_NATIVE_METRICS_NO_DOWNLOAD` to `true` in your environment before
installation.

```sh
$ export NR_NATIVE_METRICS_NO_DOWNLOAD=true
$ npm install @newrelic/native-metrics
```

If you would like to skip the build step and only attempt to download a
pre-build binary, set `NR_NATIVE_METRICS_NO_BUILD` to `true`.

```sh
$ export NR_NATIVE_METRICS_NO_BUILD=true
$ npm install @newrelic/native-metrics
```

If both env vars are set, `NO_BUILD` will override `NO_DOWNLOAD`.

If you are working behind a firewall and want to cache the downloads internally
you can set the value of the download host and remote path instead of forcing a
build:

```sh
$ export NR_NATIVE_METRICS_DOWNLOAD_HOST=http://your-internal-cache/
$ export NR_NATIVE_METRICS_REMOTE_PATH=path/to/download/folder/
$ npm install @newrelic/native-metrics
```

You can also specify a proxy host to route requests through using the `NR_NATIVE_METRICS_PROXY_HOST` environment variable:

```sh
$ export NR_NATIVE_METRICS_NO_BUILD=true
$ export NR_NATIVE_METRICS_PROXY_HOST=http://your-proxy-host/
$ npm install @newrelic/native-metrics
```

For more information, please see the agent [installation guide][install-node] and [compatibility and requirements][compatibility].

## Usage

```js
var getMetricEmitter = require('@newrelic/native-metrics')

var emitter = getMetricEmitter()
if (emitter.gcEnabled) {
  setInterval(() => {
    var gcMetrics = emitter.getGCMetrics()
    for (var type in gcMetrics) {
      console.log('GC type name:', type)
      console.log('GC type id:', gcMetrics[type].typeId)
      console.log('GC metrics:', gcMetrics[type].metrics)
    }
  }, 1000)
}
if (emitter.usageEnabled) {
  emitter.on('usage', (usage) => console.log(usage))
}
if (emitter.loopEnabled) {
  setInterval(() => {
    var loopMetrics = emitter.getLoopMetrics()
    console.log('Total time:', loopMetrics.usage.total)
    console.log('Min time:', loopMetrics.usage.min)
    console.log('Max time:', loopMetrics.usage.max)
    console.log('Sum of squares:', loopMetrics.usage.sumOfSquares)
    console.log('Count:', loopMetrics.usage.count)
  }, 1000)
}
```

The metric emitter keeps a referenced timer running for its periodic sampling
events. For a graceful shutdown of the process call `NativeMetricEmitter#unbind`.

```js
getMetricEmitter().unbind() // Process will now close gracefully.
```

If you would like to change the period of the sampling, simply unbind and then
call `NativeMetricEmitter#bind` with the new period.

```js
var emitter = getMetricEmitter({timeout: 15000})
emitter.unbind()
emitter.bind(10000) // Samples will now fire once every 10 seconds.
```

## Testing

This module includes a list of unit and functional tests.  To run these tests, use the following command

    $ npm run test

You may also run individual test suites with the following commands

    $ npm run unit
    $ npm run integration

## Support

Should you need assistance with New Relic products, you are in good hands with several support channels.

If the issue has been confirmed as a bug or is a feature request, please file a GitHub issue.

**Support Channels**

* [New Relic Documentation](https://docs.newrelic.com/docs/agents/nodejs-agent/getting-started/introduction-new-relic-nodejs): Comprehensive guidance for using our platform
* [New Relic Community](https://discuss.newrelic.com/tags/nodeagent): The best place to engage in troubleshooting questions
* [New Relic Developer](https://developer.newrelic.com/): Resources for building a custom observability applications
* [New Relic University](https://learn.newrelic.com/): A range of online training for New Relic users of every level
* [New Relic Technical Support](https://support.newrelic.com/) 24/7/365 ticketed support. Read more about our [Technical Support Offerings](https://docs.newrelic.com/docs/licenses/license-information/general-usage-licenses/support-plan).

## Privacy

At New Relic we take your privacy and the security of your information seriously, and are committed to protecting your information. We must emphasize the importance of not sharing personal data in public forums, and ask all users to scrub logs and diagnostic information for sensitive information, whether personal, proprietary, or otherwise.

We define "Personal Data" as any information relating to an identified or identifiable individual, including, for example, your name, phone number, post code or zip code, Device ID, IP address and email address.

Please review [New Relic’s General Data Privacy Notice](https://newrelic.com/termsandconditions/privacy) for more information.

## Roadmap
See our [roadmap](https://github.com/newrelic/node-newrelic/blob/main/ROADMAP_Node.md), to learn more about our product vision, understand our plans, and provide us valuable feedback.

## Contribute

We encourage your contributions to improve Native Metrics for the New Relic Node.js Agent! Keep in mind when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA, required if your contribution is on behalf of a company, please drop us an email at opensource@newrelic.com.

To [all contributors](https://github.com/newrelic/node-native-metrics/graphs/contributors), we thank you! Without your contribution, this project would not be what it is today.

If you would like to contribute to this project, please review [these guidelines](https://github.com/newrelic/node-native-metrics/blob/main/CONTRIBUTING.md).

**A note about vulnerabilities**

As noted in our [security policy](https://github.com/newrelic/node-native-metrics/security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## License
The Native Metrics for New Relic Node.js Agent package is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.

[ci-badge]: https://github.com/newrelic/node-native-metrics/workflows/native-metrics%20CI/badge.svg
[ci-link]: https://github.com/newrelic/node-native-metrics/actions?query=workflow%3A%22native-metrics+CI%22
[npm-newrelic]: https://www.npmjs.com/package/newrelic
[install-node]: https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/install-nodejs-agent
[compatibility]: https://docs.newrelic.com/docs/agents/nodejs-agent/getting-started/compatibility-requirements-nodejs-agent
