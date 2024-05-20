package com.read_en

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.yandex.metrica.YandexMetrica

class YandexMetricaModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "YandexMetrica"

    @ReactMethod fun sendEvent(name: String, params: ReadableMap) {
        YandexMetrica.reportEvent(name, params.toHashMap());
    }
}