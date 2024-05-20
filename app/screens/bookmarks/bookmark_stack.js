class BookmarkStack extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const RootStack = createStackNavigator();

    return (
      <RootStack.Navigator initialRouteName="Bookmark">
        <RootStack.Screen name="Bookmark" options={() => ({ headerShown: false })}>
          {(stack) => (
            <Bookmarks root={this.props.root}  stack={stack} />
          )}
        </RootStack.Screen>
        <RootStack.Screen name="Reader"
          options={({ navigation, route }) => ({
            headerShown: false
          })}>
          {(stack) => (
            <Reader root={this.props.root} stack={stack} />
          )}
        </RootStack.Screen>
      </RootStack.Navigator>
    );
  }
}