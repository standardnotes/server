/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

#pragma once

#include <algorithm>
#include <nan.h>

namespace nr {

template <typename T>
class Metric {
public:
  typedef T value_type;

  Metric():
    _total((value_type)0),
    _min((value_type)0),
    _max((value_type)0),
    _sumOfSquares((value_type)0),
    _count((value_type)0)
  {}

  Metric& operator+=(const value_type& val) {
    _total += val;
    if (_count == 0) {
      _min = _max = val;
    } else {
      _min = std::min(_min, val);
      _max = std::max(_max, val);
    }
    _sumOfSquares += val * val;
    ++_count;

    return *this;
  }

  const value_type& total() const {
    return _total;
  }

  const value_type& min() const {
    return _min;
  }

  const value_type& max() const {
    return _max;
  }

  const value_type& sumOfSquares() const {
    return _sumOfSquares;
  }

  const value_type& count() const {
    return _count;
  }

  void reset() {
    _total = (value_type)0;
    _min = (value_type)0;
    _max = (value_type)0;
    _sumOfSquares = (value_type)0;
    _count = (value_type)0;
  }

  v8::Local<v8::Object> asJSObject() const {
    v8::Local<v8::Object> results = Nan::New<v8::Object>();
    #define SET(key, val)                   \
      Nan::Set(                             \
        results,                            \
        Nan::New(key).ToLocalChecked(),     \
        Nan::New<v8::Number>((double)(val)) \
      )

    SET("total",        total());
    SET("min",          min());
    SET("max",          max());
    SET("sumOfSquares", sumOfSquares());
    SET("count",        count());
    #undef SET

    return results;
  }

private:
  value_type _total;
  value_type _min;
  value_type _max;
  value_type _sumOfSquares;
  value_type _count;
};

}
