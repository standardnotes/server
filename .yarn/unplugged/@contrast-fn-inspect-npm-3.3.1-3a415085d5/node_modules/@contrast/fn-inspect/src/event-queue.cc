#include <v8-profiler.h>
#include <v8.h>

#include "event-queue.h"

using namespace v8;

EventQueue::EventQueue() {
    this->head = NULL;
    this->tail = NULL;
    this->length = 0;
}

EventQueue::~EventQueue() {
    EventNode *tmp;
    while (this->head) {
        tmp = this->head;
        ;
        this->head = this->head->next;
        delete tmp;
    }
}

void EventQueue::enqueue(CodeEvent *event) {
    if (Nan::Utf8String(event->GetScriptName()).length() == 0)
        return;

    EventNode *node = new EventNode();

    node->type = strdup(CodeEvent::GetCodeEventTypeName(event->GetCodeType()));
    node->script = strdup(*Nan::Utf8String(event->GetScriptName()));
    node->func = strdup(*Nan::Utf8String(event->GetFunctionName()));
    node->lineNumber = event->GetScriptLine();

    if (this->tail) {
        this->tail->next = node;
        this->tail = node;
    } else {
        this->head = node;
        this->tail = node;
    }

    this->length += 1;
}

EventNode *EventQueue::dequeue() {
    EventNode *node = this->head;

    if (!node)
        return NULL;

    this->head = this->head->next;

    if (this->head == NULL) {
        this->tail = NULL;
    }

    this->length -= 1;

    return node;
}
