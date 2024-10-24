class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      method: 'login',
      email: null,
      password: null,
      repeat_password: null,
      securePassword: true,
      error: false,
      button_loader: false,
      remember_password_thanks: false
    }
  }

  componentDidMount() {
    if (this.props.method != undefined) {
      this.setState({
        method: this.props.method
      });
    }

    // Linking.addEventListener('url', (e)=>{
    //   Alert.alert('opened');
    // });
  }

  changeMethod(method) {
    this.setState({
      method: method,
      button_loader: false,
      error: false,
      remember_password_thanks: false
    });
  }

  async sendForm(method) {
    if (this.state.button_loader == false) {
      await this.setState({
        button_loader: true
      });

      if (method == 'login') {
        this.login();
      }
      if (method == 'reg') {
        this.reg();
      }
      if (method == 'remember_password') {
        this.remember_password();
      }
    }
  }

  async login() {
    var response = await new Request('/api/v1/users/login', {
      email: this.state.email,
      password: this.state.password
    }).get();

    await this.setState({
      button_loader: false
    });

    if (response == false) {
      return false;
    } else {
      if (response['error'] != undefined) {
        this.setState({
          error: response['error']
        });
      } else {
        await this.setState({
          error: false
        });

        root_app.setState({
          current_user: response
        }); 

        await new Storage().set('current_user', JSON.stringify(response));

        root_app.checkSubscription();
      }
    }

  }

  async reg() {
    var response = await new Request('/api/v1/users/registration', {
      email: this.state.email,
      password: this.state.password,
      repeat_password: this.state.repeat_password
    }).post();

    await this.setState({
      button_loader: false
    });

    if (response == false) {
      return false;
    } else {
      if (response['error'] != undefined) {
        this.setState({
          error: response['error']
        });
      } else {
        await this.setState({
          error: false
        });

        root_app.setState({
          current_user: response
        });

        await new Storage().set('current_user', JSON.stringify(response));
      }
    }
  }

  async remember_password() {
    var response = await new Request('/api/v1/users/remember_password', {
      email: this.state.email,
      password: this.state.password,
      repeat_password: this.state.repeat_password
    }).post();

    await this.setState({
      button_loader: false
    });

    if (response == false) {
      return false;
    } else {
      if (response['error'] != undefined) {
        this.setState({
          error: response['error']
        });
      } else {
        await this.setState({
          error: false
        });

        this.setState({
          remember_password_thanks: true
        });
      }
    }
  }

  render() {
    return (
      <SafeAreaView style={applicationStyles.save_area_view} >
        <ScrollView>
          {this.props.modal == true &&
            <View style={{ height: 35, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => this.props.close()} style={{ width: 35, height: 35, backgroundColor: '#ddd', borderRadius: 7, margin: 10 }}>
                <Image
                  style={{ height: 20, width: 20, margin: 7.5 }}
                  source={require('./app/images/header/right-menu-close.png')}
                />
              </TouchableOpacity>
            </View>
          }

          <View style={profileStyles.content}>
            {this.props.bookmark_info != undefined &&
              <React.Fragment>
                <Text style={bookmarksStyles.auth_into}>
                  Для того чтобы воспользоваться закладками или словарем,
                  необходимо
                  <Text style={{ color: '#f05458' }}> авторизоваться </Text>
                  или
                  <Text style={{ color: '#f05458' }}> зарегистрироваться</Text>
                </Text>
              </React.Fragment>
            }

            {this.state.method == 'login' &&
              <Text style={profileStyles.title}>Вход</Text>
            }
            {this.state.method == 'reg' &&
              <Text style={profileStyles.title}>Регистрация</Text>
            }
            {this.state.method == 'remember_password' &&
              <Text style={profileStyles.title}>Восстановить пароль</Text>
            }

            <View style={profileStyles.authorization_form_tabs}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => this.changeMethod('login')} style={[
                  profileStyles.authorization_form_tab,
                  this.state.method == 'login' ? { backgroundColor: app_theme_colors.backgroundDarkLight } : null
                ]}>
                  <Text style={profileStyles.authorization_form_tab_text}>Вход</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.changeMethod('reg')} style={[
                  profileStyles.authorization_form_tab,
                  this.state.method == 'reg' ? { backgroundColor: app_theme_colors.backgroundDarkLight } : null
                ]}>
                  <Text style={profileStyles.authorization_form_tab_text}>Регистрация</Text>
                </TouchableOpacity>
              </View>
            </View>

            {this.state.remember_password_thanks ? (
              <View style={profileStyles.remember_password_thanks}>
                <Text style={profileStyles.remember_password_thanks_text}>Новый пароль отправлен на почту</Text>
              </View>
            ) : (
              <React.Fragment>
                {this.state.method == 'remember_password' &&
                  <Text style={profileStyles.remember_password_info}>Новый пароль придет на почту</Text>
                }

                <View style={profileStyles.point_input}>
                  <Text style={profileStyles.input_title}>E-mail</Text>
                  <TextInput
                    onChangeText={(value) => this.setState({ email: value })}
                    style={profileStyles.input}
                    placeholder={"E-mail"}
                  />
                </View>

                {(this.state.method == 'login' || this.state.method == 'reg') &&
                  <View style={profileStyles.point_input}>
                    <Text style={profileStyles.input_title}>Пароль</Text>
                    <TextInput
                      secureTextEntry={this.state.securePassword}
                      onChangeText={(value) => this.setState({ password: value })}
                      style={profileStyles.input}
                      placeholder={"Пароль"}
                    />
                    <TouchableOpacity onPress={() => this.setState({ securePassword: !this.state.securePassword })} style={profileStyles.button_password_hide}>
                      {this.state.securePassword == true &&
                        <Image source={require('./app/images/profile/auth/password_hide.png')} style={profileStyles.password_hide_image} />
                      }
                      {this.state.securePassword == false &&
                        <Image source={require('./app/images/profile/auth/password_show.png')} style={profileStyles.password_hide_image} />
                      }
                    </TouchableOpacity>
                  </View>
                }

                {this.state.method == 'reg' &&
                  <View style={profileStyles.point_input}>
                    <Text style={profileStyles.input_title}>Повторите пароль</Text>
                    <TextInput
                      secureTextEntry={this.state.securePassword}
                      onChangeText={(value) => this.setState({ repeat_password: value })}
                      style={profileStyles.input}
                      placeholder={"Пароль"}
                    />
                    <TouchableOpacity onPress={() => this.setState({ securePassword: !this.state.securePassword })} style={profileStyles.button_password_hide}>
                      {this.state.securePassword == true &&
                        <Image source={require('./app/images/profile/auth/password_hide.png')} style={profileStyles.password_hide_image} />
                      }
                      {this.state.securePassword == false &&
                        <Image source={require('./app/images/profile/auth/password_show.png')} style={profileStyles.password_hide_image} />
                      }
                    </TouchableOpacity>
                  </View>
                }

                {this.state.error != false &&
                  <Text style={profileStyles.error_block}>{this.state.error}</Text>
                }

                <TouchableOpacity onPress={() => this.sendForm(this.state.method)} style={profileStyles.form_button}>
                  {this.state.button_loader == true &&
                    <ActivityIndicator style={{ flex: 1 }} size="small" color="#FFF" />
                  }

                  {this.state.button_loader == false &&
                    <React.Fragment>
                      {this.state.method == 'login' &&
                        <Text style={profileStyles.form_button_text}>Вход</Text>
                      }
                      {this.state.method == 'reg' &&
                        <Text style={profileStyles.form_button_text}>Регистрация</Text>
                      }
                      {this.state.method == 'remember_password' &&
                        <Text style={profileStyles.form_button_text}>Отправить</Text>
                      }
                    </React.Fragment>
                  }
                </TouchableOpacity>

                {this.state.method == 'login' &&
                  <TouchableOpacity onPress={() => this.changeMethod('remember_password')} style={profileStyles.button_remember_password}>
                    <Text style={profileStyles.remember_password_text}>Забыли пароль?</Text>
                  </TouchableOpacity>
                }
              </React.Fragment>
            )}

            <View style={{ height: 100 }}></View>

          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}