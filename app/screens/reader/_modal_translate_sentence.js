class ModalTranslateSentence extends React.Component {
  render(){
    return(
      <Modal
        animationType="fade"
        presentationStyle={'overFullScreen'}
        transparent={true}
        visible={this.props.visible}
      >
        <TouchableOpacity activeOpacity={1} style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onPress={() => this.props.close()}>
          <TouchableWithoutFeedback>
            <View style={{
              backgroundColor: root_reader.state.backgroundColorTheme,
              borderRadius: 10,
              alignItems: "center",
              width: "90%",
              shadowRadius: 4,
              overflow: 'hidden',
              elevation: 5
            }}>
              <ScrollView style={{ maxHeight: Dimensions.get('window').height - 300 }}>

                <TouchableOpacity activeOpacity={1}>
                  {this.props.translate.constructor === Array &&
                    <View style={{ margin: 10 }}>
                      {this.props.translate.map((sentence, index) =>
                        <View key={index} style={{ marginTop: 5, flexDirection: "row" }}>
                          <View style={{ width: 20 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'Times', color: '#bbb' }}>{(index + 1)}</Text>
                          </View>
                          <View style={{ width: Dimensions.get('window').width * 0.9 - 40 }}>
                            <Text style={{ color: root_reader.state.textColorTheme }}>{sentence}</Text>
                          </View> 
                        </View>
                      )}
                    </View>
                  }

                  {this.props.translate.constructor != Array &&
                    <Text style={{ padding: 10, color: root_reader.state.textColorTheme }}>
                      {this.props.translate}
                    </Text>
                  }
                </TouchableOpacity>

              </ScrollView>
              <TouchableWithoutFeedback onPress={() => this.props.close()}>
                <View style={{ margin: 10, marginTop: 15, height: 40, backgroundColor: '#f05458', width: Dimensions.get('window').width * 0.9 - 20, flexDirection: 'column', justifyContent: 'center', borderRadius: 5 }}>
                  <Text style={{ color: '#FFF', lineHeight: 40, textAlign: 'center' }}>Понятно</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>

      </Modal>
    )
  }
}