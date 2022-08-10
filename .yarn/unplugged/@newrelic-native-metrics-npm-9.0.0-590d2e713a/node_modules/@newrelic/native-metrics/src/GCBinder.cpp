/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


#include "GCBinder.hpp"

namespace nr {

GCBinder* GCBinder::_instance = nullptr;

NAN_METHOD(GCBinder::New) {
  if (_instance != NULL) {
    return Nan::ThrowError("GCBinder instance already created.");
  }

  GCBinder* obj = new GCBinder();
  obj->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(GCBinder::Read) {
  Nan::HandleScope scope;
  GCBinder* self = GCBinder::Unwrap<GCBinder>(info.This());

  v8::Local<v8::Object> results = Nan::New<v8::Object>();
  for (auto& metrics : self->_gcMetrics) {
    // first == type, second == metrics
    Nan::Set(
      results,
      Nan::New((double)metrics.first),
      metrics.second.asJSObject()
    );
    metrics.second.reset();
  }

  info.GetReturnValue().Set(results);
}

void GCBinder::_gcEnd(const v8::GCType type) {
  // HR times are in nanoseconds. A duration of 70 milliseconds in nanoseconds
  // would overflow a `Metric<unint64_t>`'s `sumOfSquares` field. It is entirely
  // believable that a 70 ms GC event could occur, so we will convert everything
  // to milliseconds and store them as doubles instead.
  uint64_t durationHr = uv_hrtime() - _gcStartTimeHR;
  _gcMetrics[type] += durationHr / 1000000.0; // 1 million ns per ms
}

}
