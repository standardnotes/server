#pragma once

#include <nan.h>
#include <v8-profiler.h>
#include <v8.h>

#include "event-queue.h"

NAN_METHOD(initHandler);
NAN_METHOD(deinitHandler);
NAN_METHOD(getNextCodeEvent);
