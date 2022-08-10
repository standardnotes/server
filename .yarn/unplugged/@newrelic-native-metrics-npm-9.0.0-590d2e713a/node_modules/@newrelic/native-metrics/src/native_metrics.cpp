/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


#include <nan.h>

#include "GCBinder.hpp"
#include "LoopChecker.hpp"

namespace nr {

NAN_MODULE_INIT(Init) {
  Nan::HandleScope scope;
  GCBinder::Init(target);
  LoopChecker::Init(target);
}

NODE_MODULE(native_metrics, Init)

}
