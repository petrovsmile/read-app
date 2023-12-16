class HomeStack extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      books_percents: {}
    }
  }

  render() {
    const RootStack = createStackNavigator();

    return (
      <RootStack.Navigator initialRouteName="Home">
        <RootStack.Screen name="Home" options={() => ({ headerShown: false })}>
          {(stack) => (
            <Home home_stack_state={this} drawer={this.props.drawer} reader_book_id={this.props.drawer.route.params != undefined && this.props.drawer.route.params.reader_book_id} stack={stack} />
          )}
        </RootStack.Screen>
        <RootStack.Screen name="Show" options={({ navigation, route }) => ({
          title: false,
          headerStyle: {
            backgroundColor: route.params.color,
            borderColor: 'transparent',
            shadowColor: 'transparent'
          },
          headerBackTitle: 'Список книг',
          headerBackTitleStyle: {
            color: '#FFF',
          },
          headerBackTitleVisible: Platform.OS === 'ios',
          headerBackImage: () => (
            <ImageBackground style={{ width: 30, height: 30, marginLeft: 10 }}
              resizeMode='cover'
              source={require('./app/images/header/arrow-left-white.png')} />
          )
        }
        )}>
          {(stack) => (
            <Show stack={stack} home_stack_state={this} root_state={this.props.root_state} />
          )}
        </RootStack.Screen>
        <RootStack.Screen name="Reader"
          options={({ navigation, route }) => ({
            headerShown: false
          })}>
          {(stack) => (
            <Reader home_stack_state={this} drawer={this.props.drawer} root_state={this.props.root_state} stack={stack} />
          )}
        </RootStack.Screen>
      </RootStack.Navigator>
    );
  }
}