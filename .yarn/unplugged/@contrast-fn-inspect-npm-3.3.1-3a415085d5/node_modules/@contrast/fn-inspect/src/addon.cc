#include <nan.h>

#include "code-events.h"
#include "func-info.h"

NAN_MODULE_INIT(Init) {
    NAN_EXPORT(target, initHandler);
    NAN_EXPORT(target, deinitHandler);
    NAN_EXPORT(target, getNextCodeEvent);

    NAN_EXPORT(target, funcInfo);
}

NODE_MODULE(addon, Init)
