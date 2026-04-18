#!/usr/bin/env ruby

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
