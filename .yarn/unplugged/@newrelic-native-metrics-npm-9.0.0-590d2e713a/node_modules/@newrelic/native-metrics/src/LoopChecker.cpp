/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


#include <algorithm>
#include <uv.h>

#include "LoopChecker.hpp"

const uint64_t SEC_TO_MICRO = static_cast<uint64_t>(1e6);

namespace nr {

uint64_t getUsageSumInUS() {
  uv_rusage_t usage;
  uv_getrusage(&usage);
  return (
    usage.ru_utime.tv_sec * SEC_TO_MICRO +
    usage.ru_utime.tv_usec +
    usage.ru_stime.tv_sec * SEC_TO_MICRO +
    usage.ru_stime.tv_usec
  );
}

NAN_METHOD(LoopChecker::Read) {
  Nan::HandleScope scope;
  LoopChecker* self = LoopChecker::Unwrap<LoopChecker>(info.This());

  v8::Local<v8::Object> results = Nan::New<v8::Object>();
  Nan::Set(results, Nan::New("usage").ToLocalChecked(), self->_tickUsageMetric.asJSObject());

  info.GetReturnValue().Set(results);
  self->_tickUsageMetric.reset();
}

LoopChecker::LoopChecker():
  _checkUsage(getUsageSumInUS())
{
  uv_check_init(uv_default_loop(), &_checkHandle);
  uv_unref((uv_handle_t*)&_checkHandle);
  _checkHandle.data = (void*)this;
}

void LoopChecker::_checkCB(uv_check_t* handle) {
  LoopChecker* self = (LoopChecker*)handle->data;
  const uint64_t usage = getUsageSumInUS();

  self->_tickUsageMetric += usage - self->_checkUsage;
  self->_checkUsage = usage;
}

}
