#include "func-info.h"

using namespace v8;

NAN_METHOD(funcInfo) {
    if (info.Length() < 1 || info[0].IsEmpty() || !info[0]->IsFunction()) {
        info.GetReturnValue().Set(Nan::Null());
        return;
    }

    Local<Function> fn = info[0].As<Function>();

    Local<Object> obj = Nan::New<Object>();
    Local<Value> resourceName = fn->GetScriptOrigin().ResourceName();

    if (!resourceName.IsEmpty()) {
        Nan::Set(obj, Nan::New("file").ToLocalChecked(), resourceName);
        Nan::Set(obj,
                 Nan::New("lineNumber").ToLocalChecked(),
                 Nan::New(fn->GetScriptLineNumber()));
        Nan::Set(obj, Nan::New("method").ToLocalChecked(), fn->GetName());
        Nan::Set(obj,
                 Nan::New("column").ToLocalChecked(),
                 Nan::New(fn->GetScriptColumnNumber()));
    }

    info.GetReturnValue().Set(obj);
}
