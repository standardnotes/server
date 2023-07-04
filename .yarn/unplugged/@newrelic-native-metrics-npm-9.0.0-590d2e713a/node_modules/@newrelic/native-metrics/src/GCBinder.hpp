/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

#pragma once

#include <map>
#include <nan.h>

#include "Metric.hpp"

namespace nr {

class GCBinder : public Nan::ObjectWrap {
public:
  static NAN_MODULE_INIT(Init) {
    v8::Local<v8::FunctionTemplate> clas = Nan::New<v8::FunctionTemplate>(New);
    clas->SetClassName(Nan::New("GCBinder").ToLocalChecked());
    clas->InstanceTemplate()->SetInternalFieldCount(1);

    SetPrototypeMethod(clas, "bind", Bind);
    SetPrototypeMethod(clas, "unbind", Unbind);
    SetPrototypeMethod(clas, "read", Read);

    constructor().Reset(Nan::GetFunction(clas).ToLocalChecked());
    Nan::Set(
      target,
      Nan::New("GCBinder").ToLocalChecked(),
      Nan::GetFunction(clas).ToLocalChecked()
    );
  }

  static NAN_METHOD(New);

  /**
   * Binds into the GC event hooks.
   */
  static NAN_METHOD(Bind) {
    _bind();
  }

  /**
   * Removes hooks into the GC events.
   */
  static NAN_METHOD(Unbind) {
    _unbind();
  }

  static NAN_METHOD(Read);

  GCBinder():
    _gcStartTimeHR(uv_hrtime())
  {
    _instance = this;
  }

  ~GCBinder() {
    _unbind();
    _instance = NULL;
  }

private:
  static GCBinder* _instance;

  static NAN_GC_CALLBACK(_gcPrologue) {
    if (GCBinder::_instance) {
      GCBinder::_instance->_gcStart();
    }
  }

  static NAN_GC_CALLBACK(_gcEpilogue) {
    if (GCBinder::_instance) {
      GCBinder::_instance->_gcEnd(type);
    }
  }

  static void _bind() {
    Nan::AddGCPrologueCallback(_gcPrologue);
    Nan::AddGCEpilogueCallback(_gcEpilogue);
  }

  static void _unbind() {
    Nan::RemoveGCPrologueCallback(_gcPrologue);
    Nan::RemoveGCEpilogueCallback(_gcEpilogue);
  }

  static inline Nan::Persistent<v8::Function> & constructor() {
    // ???
    static Nan::Persistent<v8::Function> _constructor;
    return _constructor;
  }

  void _gcStart() {
    _gcStartTimeHR = uv_hrtime();
  }

  void _gcEnd(const v8::GCType type);

  uint64_t _gcStartTimeHR;
  std::map<v8::GCType, Metric<double>> _gcMetrics;
};

}
