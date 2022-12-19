"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilingIntegration = void 0;
const hubextensions_1 = require("./hubextensions");
const integration_1 = require("./integration");
Object.defineProperty(exports, "ProfilingIntegration", { enumerable: true, get: function () { return integration_1.ProfilingIntegration; } });
// Guard for tree
if (typeof __SENTRY_PROFILING === 'undefined' || __SENTRY_PROFILING) {
    (0, hubextensions_1.addExtensionMethods)();
}
