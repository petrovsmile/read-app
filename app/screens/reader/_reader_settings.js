class ReaderSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      voices: [],
    };
  }

  componentDidMount() {
    Tts.voices().then((voices) => {
      var englishVoices = voices.filter(v => v.language && v.language.startsWith('en') && v.notInstalled !== true);
      this.setState({ voices: englishVoices });
    }).catch(() => {});
  }

  getVoiceLabel(voice) {
    var lang = voice.language || '';
    var id = voice.id || voice.name || '';

    // Region
    if (lang.startsWith('en-US') || lang === 'en_US') {
      var region = 'США';
    } else if (lang.startsWith('en-GB') || lang === 'en_GB') {
      var region = 'Британия';
    } else if (lang.startsWith('en-AU') || lang === 'en_AU') {
      var region = 'Австралия';
    } else if (lang.startsWith('en-IN') || lang === 'en_IN') {
      var region = 'Индия';
    } else {
      var region = lang.replace('en-', '').replace('en_', '').toUpperCase();
    }

    // Known Android Google TTS voice codes → gender
    var VOICE_GENDER = {
      'tpf': 'Мужской', 'iom': 'Мужской 2', 'iob': 'Мужской 3', 'iol': 'Мужской 4',
      'sfg': 'Женский', 'ene': 'Женский 2',
      'gba': 'Женский',  'rjs': 'Мужской',
      'auc': 'Женский',
    };

    // Extract code like "tpf" from "en-us-x-tpf-local"
    var parts = id.split('-');
    var code = parts.length >= 4 ? parts[3] : '';
    var genderLabel = VOICE_GENDER[code] || (code ? code.toUpperCase() : '');

    // iOS voices have human-readable names (e.g. "Karen", "Samantha")
    var iosName = voice.name || '';
    if (iosName && !iosName.startsWith('en-')) {
      genderLabel = iosName;
    }

    var isOffline = voice.networkConnectionRequired !== true;
    var connection = isOffline ? '📱 без интернета' : '🌐 нужен интернет';

    if (genderLabel) {
      return region + ' — ' + genderLabel + ' (' + connection + ')';
    }
    return region + ' (' + connection + ')';
  }

  render(){
    return(
      <React.Fragment>
        {this.props.visible == true &&
          <TouchableOpacity activeOpacity={1} style={{ position: 'absolute', width: '100%', height: '100%', right: 0, top: 40, zIndex: 10000000, }} onPress={() => this.props.closeSettings()}>
            <TouchableWithoutFeedback>
              <View
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                style={{
                  width: 212,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  position: 'absolute',
                  right: 10,
                  top: 5,
                  backgroundColor: '#fff',
                  maxHeight: 500,
                }}
              >
                <ScrollView
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                <View style={{ flexDirection: 'row', borderBottomColor: '#ddd', borderBottomWidth: 1 }}>
                  <View style={{ borderRightWidth: 1, borderRightColor: '#ddd' }}>
                    {this.props.fontSize <= 14 &&
                      <View style={{ flex: 1, opacity: 0.3 }}>
                        <Image
                          style={{ width: 70, height: 50 }}
                          source={require('./app/images/reader/fontSizeLess.png')}
                        />
                      </View>
                    }
                    {this.props.fontSize > 14 &&
                      <TouchableOpacity onPress={() => this.props.changeFontSize('less')} style={{ flex: 1 }}>
                        <Image
                          style={{ width: 70, height: 50 }}
                          source={require('./app/images/reader/fontSizeLess.png')}
                        />
                      </TouchableOpacity>
                    }
                  </View>
                  <View pointerEvents="none" style={{ position: 'absolute', height: 25, width: 30, left: 55, top: 12.5, borderRadius: 5, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#FFF' }}>
                    <Text style={{ fontSize: 13, color: '#aaa', lineHeight: 24, textAlign: 'center' }}>{this.props.fontSize}</Text>
                  </View>
                  <View style={{ borderRightWidth: 1, borderRightColor: '#ddd' }}>
                    {this.props.fontSize >= 24 &&
                      <View style={{ flex: 1, opacity: 0.3 }}>
                        <Image
                          style={{ width: 70, height: 50 }}
                          source={require('./app/images/reader/fontSizeMore.png')}
                        />
                      </View>
                    }
                    {this.props.fontSize < 24 &&
                      <TouchableOpacity onPress={() => this.props.changeFontSize('more')} style={{ flex: 1 }}>
                        <Image
                          style={{ width: 70, height: 50 }}
                          source={require('./app/images/reader/fontSizeMore.png')}
                        />
                      </TouchableOpacity>
                    }
                  </View>
                  <TouchableOpacity onPress={() => this.props.textAlignChange()}>
                    {this.props.textAlign == 'flex-start' &&
                      <Image
                        style={{ width: 70, height: 50 }}
                        source={require('./app/images/reader/align/left.png')}
                      />
                    }
                    {this.props.textAlign == 'flex-end' &&
                      <Image
                        style={{ width: 70, height: 50 }}
                        source={require('./app/images/reader/align/right.png')}
                      />
                    }
                    {this.props.textAlign == 'center' &&
                      <Image
                        style={{ width: 70, height: 50 }}
                        source={require('./app/images/reader/align/center.png')}
                      />
                    }
                    {this.props.textAlign == 'space-evenly' &&
                      <Image
                        style={{ width: 70, height: 50 }}
                        source={require('./app/images/reader/align/justify.png')}
                      />
                    }
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', borderBottomColor: '#ddd', borderBottomWidth: 1, paddingTop: 15, paddingBottom: 15 }}>
                  <TouchableOpacity onPress={() => this.props.changeColorTheme('#ffffff', '#000000', '#dddddd')} style={{ width: 30, height: 30, marginLeft: 5, marginRight: 5, borderWidth: 1, borderColor: '#c6c4c1', borderRadius: 20, backgroundColor: '#ffffff' }}>
                    {this.props.backgroundColorTheme == '#ffffff' &&
                      <Image
                        style={{ width: 13, height: 13, marginTop: 8, marginLeft: 7 }}
                        source={require('./app/images/reader/check_black.png')}
                      />
                    }
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.changeColorTheme('#eeeeee', '#000000', '#cccccc')} style={{ width: 30, height: 30, marginLeft: 5, marginRight: 5, borderWidth: 1, borderColor: '#c6c4c1', borderRadius: 20, backgroundColor: '#eeeeee' }}>
                    {this.props.backgroundColorTheme == '#eeeeee' &&
                      <Image
                        style={{ width: 13, height: 13, marginTop: 8, marginLeft: 7 }}
                        source={require('./app/images/reader/check_black.png')}
                      />
                    }
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.props.changeColorTheme('#f8f4e9', '#000000', '#d4c8a0')} style={{ width: 30, height: 30, marginLeft: 5, marginRight: 5, borderWidth: 1, borderColor: '#c6c4c1', borderRadius: 20, backgroundColor: '#f6f0e3' }}>
                    {this.props.backgroundColorTheme == '#f8f4e9' &&
                      <Image
                        style={{ width: 13, height: 13, marginTop: 8, marginLeft: 7 }}
                        source={require('./app/images/reader/check_black.png')}
                      />
                    }
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.props.changeColorTheme('#292c2c', '#ffffff', '#5a5d5d')} style={{ width: 30, height: 30, marginLeft: 5, marginRight: 5, borderWidth: 1, borderColor: '#292c2c', borderRadius: 20, backgroundColor: '#000000' }}>
                    {this.props.backgroundColorTheme == '#292c2c' &&
                      <Image
                        style={{ width: 13, height: 13, marginTop: 8, marginLeft: 7 }}
                        source={require('./app/images/reader/check_white.png')}
                      />
                    }
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.changeColorTheme('#000000', '#ffffff', '#444')} style={{ width: 30, height: 30, marginLeft: 5, marginRight: 5, borderWidth: 1, borderColor: '#000000', borderRadius: 20, backgroundColor: '#000000' }}>
                    {this.props.backgroundColorTheme == '#000000' &&
                      <Image
                        style={{ width: 13, height: 13, marginTop: 8, marginLeft: 7 }}
                        source={require('./app/images/reader/check_white.png')}
                      />
                    }
                  </TouchableOpacity>
                </View>

                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    Шрифт текста:
                  </Text>
                  <TouchableOpacity onPress={() => this.props.chanageFontFamily('LibreBaskerville-Regular')}
                    style={[(this.props.fontFamily == "LibreBaskerville-Regular") ? { padding: 7, paddingLeft: 10, paddingRight: 10, backgroundColor: '#ddd', borderRadius: 5 } : { padding: 7, paddingLeft: 10, paddingRight: 10 }]}>
                    <Text style={{ fontSize: 16, fontFamily: 'LibreBaskerville-Regular' }}>
                      Libre Baskerville
                    </Text>

                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.chanageFontFamily('Times')}
                    style={[(this.props.fontFamily == "Times") ? { padding: 7, paddingLeft: 10, paddingRight: 10, backgroundColor: '#ddd', borderRadius: 5 } : { padding: 7, paddingLeft: 10, paddingRight: 10 }]}>
                    <Text style={{ fontSize: 16, fontFamily: 'Times' }}>
                      Times
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.chanageFontFamily('Arial')}
                    style={[(this.props.fontFamily == "Arial") ? { padding: 7, paddingLeft: 10, paddingRight: 10, backgroundColor: '#ddd', borderRadius: 5 } : { padding: 7, paddingLeft: 10, paddingRight: 10 }]}>
                    <Text style={{ fontSize: 16, fontFamily: 'Arial' }}>
                      Arial
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.chanageFontFamily('Verdana')}
                    style={[(this.props.fontFamily == "Verdana") ? { padding: 7, paddingLeft: 10, paddingRight: 10, backgroundColor: '#ddd', borderRadius: 5 } : { padding: 7, paddingLeft: 10, paddingRight: 10 }]}>
                    <Text style={{ fontSize: 16, fontFamily: 'Verdana' }}>
                      Verdana
                    </Text>
                  </TouchableOpacity>
                </View>

                {this.state.voices.length > 0 &&
                  <View style={{ padding: 10, borderTopColor: '#ddd', borderTopWidth: 1 }}>
                    <Text style={{ fontSize: 16, marginBottom: 10 }}>
                      Голос озвучки предложений:
                    </Text>
                    {this.state.voices.map((voice, index) =>
                      <TouchableOpacity key={index} onPress={() => this.props.changeVoice(voice.id)}
                        style={[(this.props.ttsVoice == voice.id) ? { padding: 7, paddingLeft: 10, paddingRight: 10, backgroundColor: '#ddd', borderRadius: 5 } : { padding: 7, paddingLeft: 10, paddingRight: 10 }]}>
                        <Text style={{ fontSize: 14 }}>
                          {this.getVoiceLabel(voice)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                }
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        }
      </React.Fragment>
    )
  }
}