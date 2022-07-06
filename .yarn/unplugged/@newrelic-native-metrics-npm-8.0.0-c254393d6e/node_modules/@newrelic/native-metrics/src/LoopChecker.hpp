/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

#pragma once

#include <nan.h>

#include "Metric.hpp"

namespace nr {

class LoopChecker : public Nan::ObjectWrap {
public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> clas = Nan::New<v8::FunctionTemplate>(New);
    clas->SetClassName(Nan::New("LoopChecker").ToLocalChecked());
    clas->InstanceTemplate()->SetInternalFieldCount(1);

    SetPrototypeMethod(clas, "bind", Bind);
    SetPrototypeMethod(clas, "unbind", Unbind);
    SetPrototypeMethod(clas, "read", Read);

    constructor().Reset(Nan::GetFunction(clas).ToLocalChecked());
    Nan::Set(
      target,
      Nan::New("LoopChecker").ToLocalChecked(),
      Nan::GetFunction(clas).ToLocalChecked()
    );
  }

  static NAN_METHOD(New) {
    LoopChecker* obj = new LoopChecker();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  }

  static NAN_METHOD(Bind) {
    LoopChecker* self = LoopChecker::Unwrap<LoopChecker>(info.This());
    uv_check_start(&self->_checkHandle, &LoopChecker::_checkCB);
  }

  static NAN_METHOD(Unbind) {
    LoopChecker* self = LoopChecker::Unwrap<LoopChecker>(info.This());
    uv_check_stop(&self->_checkHandle);
  }

  static NAN_METHOD(Read);

private:
  LoopChecker();

  static inline Nan::Persistent<v8::Function> & constructor() {
    static Nan::Persistent<v8::Function> _constructor;
    return _constructor;
  }

  static void _checkCB(uv_check_t* handle);

  uv_check_t _checkHandle;
  uint64_t _checkUsage;
  Metric<uint64_t> _tickUsageMetric;
};

}
