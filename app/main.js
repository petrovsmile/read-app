import 'react-native-gesture-handler';

import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ImageBackground,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  TextInput,
  StyleSheet,
  Modal,
  Button,
  StatusBar,
  RefreshControl,
  Switch,
  Vibration,
  Linking,
  Alert
} from 'react-native';

import { WebView } from 'react-native-webview';

import { SwipeListView } from 'react-native-swipe-list-view';
import moment from 'moment';

import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- expo-file-system (replaces react-native-fs) ---
import * as FileSystem from 'expo-file-system';

var RNFS = {
  DocumentDirectoryPath: FileSystem.documentDirectory.replace(/\/$/, ''),
  readFile: async (path, encoding) => {
    return await FileSystem.readAsStringAsync(path, {
      encoding: encoding === 'utf8' ? FileSystem.EncodingType.UTF8 : undefined,
    });
  },
  writeFile: async (path, content, encoding) => {
    return await FileSystem.writeAsStringAsync(path, content, {
      encoding: encoding === 'utf8' ? FileSystem.EncodingType.UTF8 : undefined,
    });
  },
  exists: async (path) => {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  },
  mkdir: async (path) => {
    return await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  },
  unlink: async (path) => {
    return await FileSystem.deleteAsync(path, { idempotent: true });
  },
};

var file_root = RNFS.DocumentDirectoryPath;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Slider from '@react-native-community/slider';
import NetInfo from "@react-native-community/netinfo";

import { AnimatedCircularProgress } from 'react-native-circular-progress';

import * as RNIap from 'react-native-iap';

import { MobileAds, BannerView, InterstitialAdManager, RewardedAdManager } from 'react-native-yandex-mobile-ads';

MobileAds.initialize({ userConsent: true, locationConsent: true });

// --- @appmetrica/react-native-analytics (replaces NativeModules.YandexMetrica) ---
import AppMetrica from '@appmetrica/react-native-analytics';

AppMetrica.activate({ apiKey: 'c810cef0-e69a-4201-81ce-35e3d0e8ce8d' });

var YandexMetrica = {
  sendEvent: (name, params) => {
    try {
      AppMetrica.reportEvent(name, params ? JSON.stringify(params) : undefined);
    } catch (e) {
      // silently ignore analytics errors
    }
  },
};

// --- expo-av (replaces react-native-sound) ---
import { Audio } from 'expo-av';

Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

class Sound {
  constructor(url, basePath, onLoad) {
    this._sound = null;
    this._loaded = false;
    Audio.Sound.createAsync({ uri: url })
      .then(({ sound }) => {
        this._sound = sound;
        this._loaded = true;
        if (onLoad) onLoad(null);
      })
      .catch((error) => {
        if (onLoad) onLoad(error);
      });
  }

  play(onEnd) {
    if (this._sound) {
      this._sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          if (onEnd) onEnd(true);
          this._sound.unloadAsync();
        }
      });
      this._sound
        .playAsync()
        .catch(() => {
          if (onEnd) onEnd(false);
        });
    }
  }

  release() {
    if (this._sound) {
      this._sound.unloadAsync();
    }
  }

  static setCategory() {
    // no-op, handled by Audio.setAudioModeAsync
  }
}

// --- expo-store-review (replaces react-native-store-review) ---
import * as ExpoStoreReview from 'expo-store-review';

var StoreReview = {
  requestReview: () => ExpoStoreReview.requestReview(),
};
