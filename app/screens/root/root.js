var root_app;
class RootApp extends React.Component {
  constructor(props) {
    super(props);
    root_app = this;

    this.state = {
      has_internet: true,
      has_subscription: false,
      subscription_info: {},
      current_user: false,
      confirm_conditions: true,

      error_show: false,
      error_title: '',
      error_description: ''
    }

    this.type_payment = Platform.OS === 'ios' ? 'by_store' : 'by_yoo_kassa';
  }

  async componentDidMount() {

    RNIap.setup({ storekitMode: 'STOREKIT_HYBRID_MODE' })
    
    await RNIap.initConnection();
    await RNIap.getSubscriptions({ skus: ['read_1_month', 'read_6_month', 'read_1_year'] });

    var current_user = await new Storage().get('current_user');

    if (current_user != undefined) {
      await this.setState({
        current_user: JSON.parse(current_user),
      });
    }

    var confirm_conditions = await new Storage().get('confirm_conditions_' + POLICY_VERSION);
    await this.setState({
      confirm_conditions: confirm_conditions == 'true'
    });

    if (await new Storage().get('openAppFirst') == undefined) {
      //new Storage().set('openAppFirst', 'true');
      //AppMetrica.reportEvent('openAppFirst');
    }

    this.checkSubscription();

    NetInfo.addEventListener(state => {
      this.setState({
        has_internet: state.isConnected,
      });
    });
  }

  async sync_subscription_with_server(user_id, subscription_id, end_date){
    await new Request('/api/v1/payments/sync_subscription', {
      user_id: user_id,
      subscription_id: subscription_id,
      end_date: end_date,
    }, {}).post();
  }

  async checkSubscription() {
    //await new Storage().set('has_subscription', 'false');
    
    var has_subscription = await new Storage().get('has_subscription');
    if (has_subscription == undefined) {
      has_subscription = 'false';
    }

    var subscription_info = await new Storage().get('subscription_info');
    if (subscription_info != undefined) {
      subscription_info = JSON.parse(subscription_info);
    } else {
      subscription_info = {};
    }

    await this.setState({
      has_subscription: has_subscription == 'true',
      subscription_info: subscription_info
    });
 
    if (this.type_payment == 'by_store') {
      var purchases = await RNIap.getPurchaseHistory({skus: ['read_1_month', 'read_6_month', 'read_1_year']});
      if (purchases.length != 0) {
        purchases.sort(function (a, b) {
          var keyA = new Date(a.transactionDate),
            keyB = new Date(b.transactionDate);
          // Compare the 2 dates
          if (keyA > keyB) return -1;
          if (keyA < keyB) return 1;
          return 0;
        });

        var purchase = purchases[0];

        var time_subsription = moment.unix(parseInt(purchase.transactionDate) / 1000);

        if (purchase.productId == 'read_1_month') {
          var end_date = time_subsription.clone().add(1, 'months');
          var subscription_id = 1;
        }
        if (purchase.productId == 'read_6_month') {
          var end_date = time_subsription.clone().add(6, 'months');
          var subscription_id = 2;
        }
        if (purchase.productId == 'read_1_year') {
          var end_date = time_subsription.clone().add(1, 'years');
          var subscription_id = 3;
        }

        if (moment() < end_date) {
          var subscription_info = {
            end_date: end_date.format('YYYY-MM-DD HH:MM'),
            subscription_id: subscription_id
          }

          await new Storage().set('has_subscription', 'true');
          await new Storage().set('subscription_info', JSON.stringify(subscription_info));
          
          await this.setState({
            subscription_info: subscription_info,
            has_subscription: true,
          });

          if (this.state.current_user){
            this.sync_subscription_with_server(
              this.state.current_user.id,
              subscription_id,
              end_date.format('YYYY-MM-DD HH:MM')
            );
          }
        }else{
          await new Storage().set('has_subscription', 'false');

          await this.setState({
            has_subscription: false
          });
        }
      }
    }

    if (this.state.current_user != false && this.state.has_subscription == false) {
      var response = await new Request('/api/v1/users/subscription', {
        user_id: this.state.current_user.id
      }, {
        do_not_show_error: true
      }).get();
      if (response != false) {
        await this.setState({
          subscription_info: response,
          has_subscription: true,
        });
        await new Storage().set('has_subscription', 'true');
        await new Storage().set('subscription_info', JSON.stringify(response));
      }
    }

    if (this.state.has_subscription == true) {
      var subscription_info = JSON.parse(await new Storage().get('subscription_info'));

      var end_date = moment(subscription_info.end_date);
      var now_time = moment();
      if (end_date < now_time) {
        await new Storage().set('has_subscription', 'false');
        await this.setState({
          has_subscription: false,
        });
      }
    }

    return this.state.has_subscription;
  }


  showError(title, description) {
    this.setState({
      error_show: true,
      error_title: title,
      error_description: description,
    });

    setTimeout(() => {
      this.setState({
        error_show: false
      });
    }, 3000);
  }

  closeError() {
    this.setState({
      error_show: false,
    });
  }

  checkInternet() {
    NetInfo.fetch().then(state => {
      if (state.isConnected == false) {
        Alert.alert(false, 'Интернета по-прежнему нет(');
      }
      this.setState({
        has_internet: state.isConnected,
      });
    });
  }

  async confirm_conditions() {
    await new Storage().set('confirm_conditions_' + POLICY_VERSION, 'true');

    this.setState({
      confirm_conditions: true
    });
  }

  render() {
    const Drawer = createDrawerNavigator();

    return (
      <React.Fragment>
        <TargetVersion />
        
        {this.state.confirm_conditions == false ? (
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Image
                style={{ height: 200, width: 200, }}
                source={require('./app/images/layouts/logo.png')}
              />
            </View>
            <View>
              <Text style={{ textAlign: 'center' }}>Продолжая пользоваться приложением,</Text>
              <Text style={{ textAlign: 'center' }}>вы принимаете условия</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL("https://read-en.ru/apps_policy")}>
              <Text style={{ color: app_theme_colors.red, textAlign: 'center' }}>Политики конфидициальности</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://read-en.ru/apps_terms_and_conditions")} style={{ marginBottom: 15 }}>
              <Text style={{ color: app_theme_colors.red, textAlign: 'center' }}>Пользовательского соглашения</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.confirm_conditions()} style={profileStyles.form_button}>
              <Text style={profileStyles.form_button_text}>Продолжить</Text>
            </TouchableOpacity>

          </View>
        ) : (
          <React.Fragment>
            {this.state.error_show == true &&
              <TouchableOpacity onPress={() => this.closeError()} style={applicationStyles.error_request}>
                <View style={applicationStyles.error_request_texts}>
                  <Text style={applicationStyles.error_request_text}>
                    {this.state.error_title}
                  </Text>

                  {this.state.error_description != undefined &&
                    <Text style={applicationStyles.error_request_text}>
                      {this.state.error_description}
                    </Text>
                  }
                </View>
                <View style={applicationStyles.error_request_icon}>
                  <Image source={require('./app/images/layouts/error_close.png')} style={applicationStyles.error_request_icon_image} />
                </View>
              </TouchableOpacity>
            }
            <NavigationContainer>
              <Drawer.Navigator initialRouteName="Books"
                screenOptions={() => ({
                  drawerActiveBackgroundColor: '#f05458',
                  drawerActiveTintColor: '#FFF',
                  header: ({ navigation, route, options }) => {
                    const title = options.title;

                    return (<Header navigation={navigation} title={title} />);
                  }
                })}>
                <Drawer.Screen name="Books"
                  options={() => ({
                    title: 'Книги',
                    headerShown: false
                  })}>
                  {(drawer) => (
                    <HomeStack drawer={drawer} root_state={this.state} />
                  )}
                </Drawer.Screen>
                <Drawer.Screen name="Bookmarks"
                  options={() => ({
                    title: 'Закладки',
                    headerShown: false
                  })}>
                  {(drawer) => (
                    <BookmarkStack drawer={drawer} root_state={this.state} />
                  )}
                </Drawer.Screen>
                <Drawer.Screen name="Subscription"
                  options={() => ({
                    title: 'PRO-доступ',
                  })}>
                  {(drawer) => (
                    <Subscription drawer={drawer} root={this} />
                  )}
                </Drawer.Screen>
                <Drawer.Screen name="Profile"
                  options={() => ({
                    title: 'Профиль',
                  })}>
                  {() => (
                    <Profile root_state={this.state} />
                  )}
                </Drawer.Screen>
              </Drawer.Navigator>
            </NavigationContainer>
          </React.Fragment>
        )
        }
      </React.Fragment>
    );
  }
}
