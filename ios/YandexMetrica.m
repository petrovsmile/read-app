#import "YandexMetrica.h"
#import <YandexMobileMetrica/YandexMobileMetrica.h>

@implementation YandexMetrica

RCT_EXPORT_MODULE(YandexMetrica);

RCT_EXPORT_METHOD(sendEvent:(NSString *)name params:(NSDictionary *)params) {
  [YMMYandexMetrica reportEvent:name parameters:params onFailure:^(NSError *error) {
      NSLog(@"REPORT ERROR: %@", [error localizedDescription]);
  }];
}

@end