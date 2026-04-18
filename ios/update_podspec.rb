#!/usr/bin/env ruby

# Remove YandexMobileAdsSample that causes build issues
sample_path = File.expand_path('../node_modules/YandexMobileAdsSample', __dir__)
if File.exist?(sample_path)
  FileUtils.rm_rf(sample_path)
  puts "✓ Removed YandexMobileAdsSample"
end

yandex_mobile_ads_path = File.expand_path('../node_modules/yandex-mobile-ads', __dir__)
if File.exist?(yandex_mobile_ads_path)
  FileUtils.rm_rf(yandex_mobile_ads_path)
  puts "✓ Removed yandex-mobile-ads"
end

# Update YandexMobileAds version in react-native-yandex-mobile-ads podspec
podspec_path = File.expand_path('../node_modules/react-native-yandex-mobile-ads/react-native-yandex-mobile-ads.podspec', __dir__)

if File.exist?(podspec_path)
  content = File.read(podspec_path)

  # Replace old versions with new ones
  updated = content.gsub(
    "s.dependency 'YandexMobileAds', '5.5.0'",
    "s.dependency 'YandexMobileAds', '5.9.1'"
  ).gsub(
    "s.dependency 'YandexMobileAdsInstream', '0.15.0'",
    "s.dependency 'YandexMobileAdsInstream', '0.19.0'"
  )

  File.write(podspec_path, updated) if updated != content
  puts "✓ Updated YandexMobileAds versions in podspec"
else
  puts "⚠ Podspec not found at #{podspec_path}"
end
