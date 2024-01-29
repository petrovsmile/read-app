class ModalTranslateWord extends React.Component {
  render() {
    return (
      <Modal
        animationType="fade"
        presentationStyle={'overFullScreen'}
        transparent={true}
        visible={this.props.visible}
      >
        <TouchableOpacity activeOpacity={1} style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onPress={() => this.props.close()}>
          <TouchableWithoutFeedback>
            <React.Fragment>
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

              {this.props.has_subscription == false &&
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', position: 'absolute', left: 0, bottom: 0, width: Dimensions.get('window').width, height: 50, backgroundColor: '#000' }}>
                  <BannerView
                    adUnitId={'R-M-1281415-12'}
                    size="BANNER_320x50"
                  />
                </View>
              }
            </React.Fragment>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    )
  }
}