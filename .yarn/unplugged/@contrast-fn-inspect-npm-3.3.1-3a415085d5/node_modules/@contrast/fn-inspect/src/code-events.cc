#include "code-events.h"
#include "event-queue.h"

using namespace v8;

class FnInspectCodeEventHandler : public CodeEventHandler {
  public:
    FnInspectCodeEventHandler(Isolate *isolate) : CodeEventHandler(isolate) {
        this->isolate = isolate;
    }

    void Handle(CodeEvent *event) {
        /*
         * If Handle() is invoked from a worker thread (i.e. during
         * garbage collection) we don't have access to the isolate
         * so just bail
         */
        if (Isolate::GetCurrent() != isolate) {
            return;
        }
        events.enqueue(event);
    }

    EventNode *dequeue() {
        return this->events.dequeue();
    }

    unsigned int eventCount() {
        return this->events.length;
    }

  private:
    Isolate *isolate;
    EventQueue events;
};

FnInspectCodeEventHandler *handler;

NAN_METHOD(initHandler) {
    handler = new FnInspectCodeEventHandler(info.GetIsolate());
    handler->Enable();
}

NAN_METHOD(deinitHandler) {
    handler->Disable();

    delete handler;
    handler = NULL;
}

NAN_METHOD(getNextCodeEvent) {
    EventNode *node = handler->dequeue();

    if (!node)
        return;

    Local<Object> obj = Nan::New<Object>();

    Nan::Set(obj,
             Nan::New("script").ToLocalChecked(),
             Nan::New(node->script).ToLocalChecked());
    Nan::Set(obj,
             Nan::New("func").ToLocalChecked(),
             Nan::New(node->func).ToLocalChecked());
    Nan::Set(obj,
             Nan::New("type").ToLocalChecked(),
             Nan::New(node->type).ToLocalChecked());
    Nan::Set(obj,
             Nan::New("lineNumber").ToLocalChecked(),
             Nan::New(node->lineNumber));

    info.GetReturnValue().Set(obj);

    delete node;
}
