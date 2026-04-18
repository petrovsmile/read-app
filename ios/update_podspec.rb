#!/usr/bin/env ruby

# Clean up any remaining Yandex sample/demo packages
%w[YandexMobileAdsSample yandex-mobile-ads YandexMobileAds YandexMobileAdsInstream].each do |pkg|
  pkg_path = File.expand_path("../node_modules/#{pkg}", __dir__)
  if File.exist?(pkg_path)
    FileUtils.rm_rf(pkg_path)
    puts "✓ Removed #{pkg}"
  end
end

puts "✓ Cleanup complete"
