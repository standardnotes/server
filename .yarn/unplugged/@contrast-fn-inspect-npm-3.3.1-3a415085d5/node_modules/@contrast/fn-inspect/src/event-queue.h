#pragma once

#include <nan.h>
#include <v8-profiler.h>
#include <v8.h>

using namespace v8;

class EventNode {
  public:
    char *type;
    char *script;
    char *func;
    int lineNumber;
    EventNode *next;
    ~EventNode() {
        free(this->type);
        free(this->script);
        free(this->func);
    }
};

/**
 * Implements a simple queue of code events that can be
 * consumed.
 *
 * Thread-Safety: There's no locking on these methods so
 * they aren't thread safe.  However this should be OK
 * as the expectation is these methods are only ever called
 * from the main JS thread and they are blocking, there will
 * only ever be a single thread calling it as a time.  We
 * may want to revisit this if we ever want to support
 * handling events from worker_threads.
 */
class EventQueue {
  public:
    EventQueue();
    ~EventQueue();
    void enqueue(CodeEvent *event);
    EventNode *dequeue();
    unsigned int length;

  private:
    EventNode *head;
    EventNode *tail;
};
