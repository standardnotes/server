'use strict';

const binding = require('node-gyp-build')(__dirname);

let codeEventsInited = false;
let codeEventListener = null;
let timer = null;

module.exports = {
  /**
   * Retrieves name, type, column, lineNumber and file from a function reference
   *
   * @param {Function} fn function reference to obtain info
   * @return {FunctionInfo | null}
   */
  funcInfo(fn) {
    const info = binding.funcInfo(fn);
    if (info === null) return null;

    info.type = fn.constructor.name;
    return info;
  },

  /**
   * Sets the function for processing v8 code events.
   * Will start listening for code events if not already listening.
   * starts a timer which polls for an available code event once every `interval` value.
   *
   * @param {Function} cb callback function to call
   * @param {number} [interval=1] how often to get code events in ms
   */
  setCodeEventListener(cb, interval = 1) {
    if (codeEventsInited) {
      codeEventListener = cb;
      return;
    }

    binding.initHandler();
    codeEventsInited = true;
    codeEventListener = cb;
    timer = setInterval(() => {
      const codeEvent = binding.getNextCodeEvent();
      if (codeEvent) codeEventListener(codeEvent);
    }, interval);
  },

  /**
   * Stop listening for v8 code events
   */
  stopListening() {
    if (!codeEventsInited) return;

    clearInterval(timer);
    binding.deinitHandler();
    codeEventListener = null;
    codeEventsInited = false;
  },
};
