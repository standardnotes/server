
# Node Compatibility Notes
This document details issues specific to certain versions of node in regards to
the native metrics module. It is a living document to be updated as new problems
are found.

### CPU Metrics
Our native module relies on the function `uv_getrusage` to measure CPU usage.
This function was added to libuv in [version 0.11.20][libuv 0.11.20] which was
incorporated into Node in [version 0.11.12][node 0.11.12]. As of the time of
this writing, both CPU measurements and loop timing require this function and
thus can not be supported on earlier node versions.

[libuv 0.11.20]: https://github.com/libuv/libuv/releases/tag/v0.11.20
[node 0.11.12]: https://github.com/nodejs/node/releases/tag/v0.11.12
