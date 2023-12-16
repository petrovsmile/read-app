class ModalTranslateWord extends React.Component {
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
              margin: 20,
              backgroundColor: root_reader.state.backgroundColorTheme,
              borderRadius: 10,
              alignItems: "center",
              width: 250,
              shadowRadius: 4,
              overflow: 'hidden',
              elevation: 5
            }}>
              <View style={{ paddingLeft: 10, paddingRight: 10, marginTop: 15 }}>
                <Text style={{ color: '#f05458', fontSize: 19 }}>{this.props.original}</Text>
              </View>
              {this.props.transcription != null &&
                <View style={{ paddingLeft: 10, paddingRight: 10, marginTop: 10 }}>
                  <Text style={{ color: '#aaa' }}>[{this.props.transcription}]</Text>
                </View>
              } 
              <View style={{ paddingLeft: 10, paddingRight: 10, marginTop: 10 }}>
                <Text style={{ color: root_reader.state.textColorTheme, textAlign: 'center' }}>{this.props.translate}</Text>
              </View>
              <TouchableWithoutFeedback onPress={() => this.props.close()}>
                <View style={{ margin: 10, marginTop: 15, height: 40, backgroundColor: '#f05458', width: 230, flexDirection: 'column', justifyContent: 'center', borderRadius: 5 }}>
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