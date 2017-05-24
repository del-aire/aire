#include <node.h>
#include <uv.h>
#include <iostream>
#include <unistd.h>
#include "Dht.h"

using namespace std;

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;
using v8::Persistent;

struct Work {
    // In combination with "libuv":
    uv_work_t workRequest;

    // JavaScript Callback:
    Persistent<Function> callbackFunction;

    // Request Information:
    unsigned int sensorType;
    unsigned int gpioPin;

    // Dht Sensor:
    DhtRecord *dhtRecord;
};

static void ReadDhtAsync(uv_work_t *workRequest) {
    Work *work = static_cast<Work *>(workRequest->data);
    
    work->dhtRecord = readDht(work->sensorType, work->gpioPin);
}

static void ReadDhtAsyncComplete(uv_work_t *workRequest, int status) {
    Isolate *isolate = Isolate::GetCurrent();

    // Scope:
    v8::HandleScope handleScope(isolate);

    // Original Work Request:
    Work *work = static_cast<Work*>(workRequest->data);

    // Error?
    if(work->dhtRecord->sensorCondition != DHT_OK) {
        char const* withError;

        switch(work->dhtRecord->sensorCondition) {
            case DHT_ERROR_TIMEOUT:
                withError = "Timeout.";
                break;
            case DHT_ERROR_CHECKSUM:
                withError = "Checksum.";
                break;
            default:
                withError = "Undefined.";
                break;
        }

        Local<Value> argv[3] = {
            String::NewFromUtf8(isolate, withError), Number::New(isolate, -1.0), Number::New(isolate, -1.0)
        };

        Local<Function>::New(isolate, work->callbackFunction)->Call(
            isolate->GetCurrentContext()->Global(), 3, argv
        );
    }
    else {
        Local<Value> argv[3] = {
            v8::Undefined(isolate), Number::New(isolate, work->dhtRecord->mHumidity), Number::New(isolate, work->dhtRecord->mTemperature)
        };

        Local<Function>::New(isolate, work->callbackFunction)->Call(
            isolate->GetCurrentContext()->Global(), 3, argv
        );
    }

    // Cleanup:
    work->callbackFunction.Reset();

    delete work;
}

void ReadDht(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();

    Work* work = new Work();
    work->workRequest.data = work;

    // Request Information:
    work->sensorType = args[0]->IntegerValue();
    work->gpioPin    = args[1]->IntegerValue();

    // Callback:
    Local<Function> callbackFunction = Local<Function>::Cast(
        args[2] // The Callback Function should be the first Argument.
    );
    work->callbackFunction.Reset(isolate, callbackFunction);

    // Queue:
    uv_queue_work(
        uv_default_loop(), &work->workRequest, ReadDhtAsync, ReadDhtAsyncComplete
    );
    
    args.GetReturnValue().Set(
        v8::Undefined(isolate)
    );
}

void Init(Local<Object> exports) {
    NODE_SET_METHOD(exports, "readDht", ReadDht);
}

NODE_MODULE(dht, Init)