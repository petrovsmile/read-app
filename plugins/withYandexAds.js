const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("expo/config-plugins");

function withYandexAds(config) {
  // Add Yandex Ads Maven repository to project-level build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("yandex-ads-releases")) {
      return config;
    }

    config.modResults.contents = config.modResults.contents.replace(
      /allprojects\s*\{[\s\S]*?repositories\s*\{/,
      (match) =>
        `${match}\n        maven { url "https://artifactory.yandex.net/artifactory/yandex-ads-releases" }`
    );

    return config;
  });

  // Add missingDimensionStrategy and resConfigs to app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("missingDimensionStrategy")) {
      return config;
    }

    config.modResults.contents = config.modResults.contents.replace(
      /defaultConfig\s*\{/,
      (match) =>
        `${match}\n        missingDimensionStrategy "store", "play"\n        resConfigs "ru", "en"`
    );

    return config;
  });

  return config;
}

module.exports = withYandexAds;
