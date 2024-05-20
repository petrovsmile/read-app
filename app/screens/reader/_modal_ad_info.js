class ModalAdInfo extends React.Component {
  render(){
    return(
      <React.Fragment>
        <View style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }}>

          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: "#FFF",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>


            <View style={{ padding: 30 }}>
              <Text style={{ fontSize: 17 }}>
                Чтобы приложение было бесплатным, мы вынуждены показывать рекламу. {"\n"} {"\n"}Вы можете приобрести PRO-версию, чтобы отключить рекламу, а еще будет доступен режим чтения без интернета.
              </Text>

              <TouchableOpacity onPress={() => this.props.showAd()} style={{ marginTop: 30, backgroundColor: '#75b641', height: 50, borderRadius: 10 }}>
                <Text style={{ color: '#FFF', textAlign: 'center', lineHeight: 50, fontSize: 16 }}>Смотреть рекламу</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.props.tabs.navigation.navigate('Subscription')} style={{ marginTop: 15, marginBottom: 30, backgroundColor: '#f05458', height: 50, borderRadius: 10 }}>
                <Text style={{ color: '#FFF', textAlign: 'center', lineHeight: 50, fontSize: 16 }}>Приобрести PRO-версию</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </React.Fragment>
    )
  }
}