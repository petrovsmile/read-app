module.exports = {
  name: "Read",
  slug: "read-en",
  version: "1.2.1",
  orientation: "portrait",
  icon: "./assets/icon.jpg",
  splash: {
    image: "./assets/splash.jpg",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    bundleIdentifier: "org.reactjs.native.example.read-en",
    buildNumber: "1",
    supportsTablet: false,
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["read"],
          CFBundleURLName: "auth",
        },
      ],
    },
  },
  android: {
    package: "com.read_en",
    versionCode: 89,
    permissions: ["INTERNET", "ACCESS_NETWORK_STATE"],
    intentFilters: [
      {
        action: "VIEW",
        data: [{ scheme: "read", host: "auth" }],
        category: ["DEFAULT", "BROWSABLE"],
      },
    ],
  },
  plugins: [
    "expo-font",
    "expo-splash-screen",
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          minSdkVersion: 24,
          buildToolsVersion: "36.0.0",
          kotlinVersion: "2.1.20",
        },
        ios: {
          deploymentTarget: "15.1",
        },
      },
    ],
    "./plugins/withYandexAds",
  ],
};
