var scroll_percent = 0;


class Reader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      current_page: null,
      page: '',
      pages: null,
      percent: 0,

      paragraphs: false,
      show_list: false,

      showTranslateWord: false,
      showTranslateSentence: false,

      showThemeSetting: false,

      translate_icon_size: false,
      fontSize: false,
      textAlign: false,

      fontFamily: false,

      backgroundColorTheme: false,
      textColorTheme: false,
      secondColorTheme: false,

      showTraining: false,

      showAdInfo: false,
      showAdOpacity: false,

      showNoAd: false,

      auth_modal: false,

      bookmark: false,

      word_in_dictionary: false,

      ttsVoice: false,
    };

    this.modalTranslateWordOriginal = null;
    this.modalTranslateWordTranscription = null;
    this.modalTranslateWordTranslate = null;

    this.modalTranslateSentence = "";

    this.book_name;
    this.book_name_en;

    this.paragraphsCoords = {};
  }


  async componentDidMount() {
    this.have_file = await new Storage().get('have_file_' + this.props.stack.route.params.book_id, '') == 'true';

    var books = await RNFS.readFile(file_root + '/' + BOOKS_FILENAME, 'utf8');
    books = JSON.parse(books);

    books.map((book) => {
      if (book.id == this.props.stack.route.params.book_id) {
        this.book_name = book.name;
        this.book_name_en = book.name_en;
      }
    });

    YandexMetrica.sendEvent('openReader', {
      book_name: this.book_name
    });

    var bookmark = await new Storage().get('bookmark_' + this.props.stack.route.params.book_id);

    if (bookmark != undefined) {
      await this.setState({
        bookmark: JSON.parse(bookmark).paragraph,
      });
    }

    var settings = await new Storage().get('themeReaderSettings');

    if (settings == undefined) {
      settings = {
        translate_icon_size: 24,
        fontSize: 18,
        textAlign: 'flex-start',
        backgroundColorTheme: '#ffffff',
        textColorTheme: '#000000',
        secondColorTheme: '#bbb',
        fontFamily: 'LibreBaskerville-Regular',
      }
      new Storage().set('themeReaderSettings', JSON.stringify(settings));
    } else {
      settings = JSON.parse(settings);
    }

    var ttsVoice = await new Storage().get('ttsVoice');

    if (!ttsVoice) {
      try {
        var allVoices = await Tts.voices();
        var englishVoices = allVoices.filter(function(v) { return v.language && v.language.startsWith('en') && v.notInstalled !== true; });
        if (englishVoices.length > 0) {
          ttsVoice = englishVoices[0].id;
          Tts.setDefaultVoice(ttsVoice);
          new Storage().set('ttsVoice', ttsVoice);
        }
      } catch(e) {}
    }

    await this.setState({
      translate_icon_size: settings['translate_icon_size'],
      fontSize: settings['fontSize'],
      textAlign: settings['textAlign'],
      backgroundColorTheme: settings['backgroundColorTheme'],
      textColorTheme: settings['textColorTheme'],
      secondColorTheme: settings['secondColorTheme'],
      fontFamily: settings['fontFamily'],
      ttsVoice: ttsVoice || false,
    });

    readerStore.setThemeSettings(settings);
    readerStore.setBookmark(this.state.bookmark);
    readerStore.setPage(this.state.page);
    if (ttsVoice) readerStore.setTtsVoice(ttsVoice);

    if (this.have_file == true) {
      var words = await RNFS.readFile(file_root + '/books/' + this.props.stack.route.params.book_id + '/words.json');
      words = JSON.parse(words);

      var pagination = await RNFS.readFile(file_root + '/books/' + this.props.stack.route.params.book_id + '/pagination.json');
      pagination = JSON.parse(pagination);
    } else {
      var words = await new Request('/books/' + this.props.stack.route.params.book_id + '/result/words.json', {}, {}).get();
      var pagination = await new Request('/books/' + this.props.stack.route.params.book_id + '/result/pagination.json', {}, {}).get();
    }

    readerStore.setListWords(words);

    if (this.props.stack.route.params.bookmark == undefined) {
      var page = await new Storage().get('page_' + this.props.stack.route.params.book_id);

      if (page == undefined) {
        page = 1;
      }
    } else {
      var page = this.props.stack.route.params.bookmark.page;
    }


    await this.setState({
      page: parseInt(page),
      pages: Object.keys(pagination).length,
    });


    this.openPage(true);

    var haveTraining = await new Storage().get('haveTraining') == 'true';
    if (haveTraining == false) {
      this.setState({
        showTraining: true,
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      paragraphs: false,
    });
    readerStore.clearListWords();
    clearTimeout(this._scrollRestoreTimer);
  }

  async openPage(first_load) {
    var open_page = true;

    if (this.have_file == false && this.props.root.state.has_internet == false) {
      open_page = false;
      Alert.alert('Отсутствует подключение к интернету');
    }

    if (open_page == true) {

      scroll_percent = 0;

      await this.setState({ show_list: false, paragraphs: false });

      await new Storage().set('page_' + this.props.stack.route.params.book_id, this.state.page.toString());

      this.setPercent();

      if (this.have_file == true) {
        var response = await RNFS.readFile(file_root + '/books/' + this.props.stack.route.params.book_id + '/pagination.json');
        var pagination = JSON.parse(response);
      } else {
        var pagination = await new Request('/books/' + this.props.stack.route.params.book_id + '/result/pagination.json', {}, {}).get();
      }

      this.goBookUp(this.props.stack.route.params.book_id);

      var pageItems = pagination[this.state.page];
      var bookId = this.props.stack.route.params.book_id;
      var paragraphs = [];
      var batchSize = 3;
      for (var i = 0; i < pageItems.length; i += batchSize) {
        var batch = pageItems.slice(i, i + batchSize);
        var results = await Promise.all(batch.map(async (paragraphId) => {
          if (this.have_file == true) {
            var response = await RNFS.readFile(file_root + '/books/' + bookId + '/paragraphs/' + paragraphId + '.json');
            return { name: paragraphId, sentences: JSON.parse(response) };
          } else {
            var sentences = await new Request('/books/' + bookId + '/result/paragraphs/' + paragraphId + '.json', {}, {}).get();
            return sentences !== false ? { name: paragraphId, sentences: sentences } : null;
          }
        }));
        results.forEach(function(p) { if (p !== null) paragraphs.push(p); });
      }

      if (paragraphs.length != 0) {
        if (this.props.root.state.has_subscription == false) {
          if (paragraphs.length > 3) paragraphs.splice(3, 0, { _type: 'ad', _key: 'ad_3' });
          if (paragraphs.length > 8) paragraphs.splice(8, 0, { _type: 'ad', _key: 'ad_8' });
        }

        await this.setState({
          paragraphs: paragraphs,
          show_list: true,
        });

        if (first_load == true && this.props.stack.route.params.bookmark == undefined) {
          var scroll = await new Storage().get('scroll_' + this.props.stack.route.params.book_id);

          this._scrollRestoreTimer = setTimeout(() => {
            if (this.flatListRef) {
              this.flatListRef.scrollToOffset({ offset: parseInt(scroll), animated: false });
            }
          });
        }
      }

      this.setState({
        current_page: this.state.page
      });
    }
  }

  async prevPage() {
    await this.setState({
      page: this.state.page - 1,
    });

    this.checkAd();
  }

  async nextPage() {
    await this.setState({
      page: this.state.page + 1,
    });

    this.checkAd();
  }

  async checkAd() {
    if (this.props.root.state.has_internet == true && this.props.root.state.has_subscription == false) {
      var time_ad = await new Storage().get('time_ad');

      if (time_ad == undefined) {
        time_ad = moment();
        await new Storage().set('time_ad', moment().format());
      } else {
        time_ad = moment(time_ad);
      }

      var now_time = moment();

      var range_time = (now_time - time_ad) / 1000 / 60;

      //range_time = 40;

      if (range_time < 30) {
        this.openPage(false);
      } else {
        if (appStore.show_subsription == true) {
          this.showAdInfo();
        } else {
          this.showAd();
        }
      }
    } else {
      this.openPage(false);
    }
  }

  showAdInfo() {
    YandexMetrica.sendEvent('showAdInfo', { platform: Platform.OS });

    this.setState({
      showAdInfo: true,
    });
  }

  closeAdInfo() {
    this.setState({
      showAdInfo: false,
      page: this.state.current_page
    });
  }


  closeNoAdInfo() {
    this.setState({
      showNoAd: false,
    });
  }


  closeTranslateWord() {
    this.setState({
      showTranslateWord: false,
    });
  }

  closeTranslateSentence() {
    this.setState({
      showTranslateSentence: false,
    });
  }

  async showAd() {
    await this.setState({
      showAdInfo: false,
      showAdOpacity: true,
    });

    RewardedAdManager.showAd('R-M-1281415-13')
      .then((resp) => {

        if (this.state.showAdOpacity == true) {
          this.setState({
            showAdOpacity: false,
          });
          new Storage().set('time_ad', moment().format());
          this.openPage(false);
        }

      })
      .catch((error: any) => {

        if (this.state.showAdOpacity == true) {
          this.setState({
            showAdOpacity: false,
          });
          if (this.state.showNoAd == false) {
            this.setState({
              showNoAd: true,
            });
          }
          this.openPage(false);
        }

      });
  }

  closeTraining() {
    new Storage().set('haveTraining', 'true');

    this.setState({
      showTraining: false,
    });
  }


  sliderValueChange(value) {
    var page = parseInt((value / (100 / (this.state.pages - 1))).toFixed(0)) + 1;
    this.setState({
      page: page,
    });
  }

  async onSlidingComplete() {

    YandexMetrica.sendEvent('slidingPage', { platform: Platform.OS });

    this.checkAd();
  }

  onScroll(event) {
    if (event.nativeEvent.contentSize.height < event.nativeEvent.layoutMeasurement.height) {
      scroll_percent = 100;
    } else {
      scroll_percent = (event.nativeEvent.contentOffset.y / (event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height)) * 100;
      if (scroll_percent > 100) {
        scroll_percent = 100;
      }
    }
  }
  onScrollEndDrag(event) {
    new Storage().set('scroll_' + this.props.stack.route.params.book_id, event.nativeEvent.contentOffset.y.toString());
    this.setPercent();
  }

  async setPercent() {
    var percent = parseInt(((parseFloat(this.state.page - 1) / parseFloat(this.state.pages)) * 100));

    percent = percent + ((100 / this.state.pages) * (scroll_percent / 100));
    percent = parseInt(percent.toFixed(0));

    if (percent > 98) {
      percent = 100
    }

    await new Storage().set('percent_' + this.props.stack.route.params.book_id, percent.toString());

    var percents = this.props.root.state.books_percents;
    percents[this.props.stack.route.params.book_id] = percent;

    this.props.root.setState({
      books_percents: percents,
    });

    this.setState({
      percent: percent,
    });
  }


  setBookmark(value) {
    readerStore.setBookmark(value);
    this.setState({
      bookmark: value,
    });
  }

  openAuthModal() {
    this.setState({
      showTranslateWord: false,
      auth_modal: true,
    });
  }

  async openTranslateWord(original, translate, transcription) {
    this.modalTranslateWordOriginal = original;
    this.modalTranslateWordTranscription = transcription;
    this.modalTranslateWordTranslate = translate;

    var word = await new Storage().get('word_' + original);

    this.setState({
      word_in_dictionary: word != undefined,
      showTranslateWord: true,
    });
  }

  translateSentence(value) {
    this.modalTranslateSentence = value;
    this.setState({
      showTranslateSentence: true,
    });
  }

  openThemeSetting() {

    YandexMetrica.sendEvent('openThemeSetting', { open: !this.state.showThemeSetting });

    this.setState({
      showThemeSetting: !this.state.showThemeSetting,
    });
  }


  chanageFontFamily(fontFamily) {
    this.setState({
      show_list: false,
    }, function () {
      AsyncStorage.getItem('themeReaderSettings').then((settings) => {
        settings = JSON.parse(settings);
        settings['fontFamily'] = fontFamily;
        new Storage().set('themeReaderSettings', JSON.stringify(settings)).then(() => {
          YandexMetrica.sendEvent('changeProperty', { fontFamily: fontFamily });
          this.setState({
            fontFamily: fontFamily,
            show_list: true,
          });
          readerStore.setThemeSettings({ fontFamily: fontFamily });
        });

      });
    });
  }

  changeColorTheme(backgroundColor, textColor, secondColor) {
    this.setState({
      show_list: false,
    }, function () {
      AsyncStorage.getItem('themeReaderSettings').then((settings) => {
        settings = JSON.parse(settings);

        settings['backgroundColorTheme'] = backgroundColor;
        settings['textColorTheme'] = textColor;
        settings['secondColorTheme'] = secondColor;

        YandexMetrica.sendEvent('changeProperty', { colorTheme: backgroundColor });

        new Storage().set('themeReaderSettings', JSON.stringify(settings)).then(() => {
          this.setState({
            backgroundColorTheme: backgroundColor,
            textColorTheme: textColor,
            secondColorTheme: secondColor,
            show_list: true,
          });
          readerStore.setThemeSettings({
            backgroundColorTheme: backgroundColor,
            textColorTheme: textColor,
            secondColorTheme: secondColor,
          });
        });
      });
    });
  }

  textAlignChange() {
    this.setState({
      show_list: false,
    }, function () {

      var nowTextAlign = this.state.textAlign;
      if (nowTextAlign == 'flex-start') {
        nowTextAlign = 'flex-end';
      } else {
        if (nowTextAlign == 'flex-end') {
          nowTextAlign = 'center';
        } else {
          if (nowTextAlign == 'center') {
            nowTextAlign = 'space-evenly';
          } else {
            nowTextAlign = 'flex-start';
          }
        }
      }

      AsyncStorage.getItem('themeReaderSettings').then((settings) => {
        settings = JSON.parse(settings);

        settings['textAlign'] = nowTextAlign;

        YandexMetrica.sendEvent('changeProperty', { textAlign: nowTextAlign });

        new Storage().set('themeReaderSettings', JSON.stringify(settings)).then(() => {

          this.setState({
            show_list: true,
            textAlign: nowTextAlign,
          });
          readerStore.setThemeSettings({ textAlign: nowTextAlign });
        });

      });
    });
  }

  changeFontSize(type_change) {
    this.setState({
      show_list: false,
    }, function () {

      if (type_change == 'more') {
        var newFontSize = this.state.fontSize + 2;
      } else {
        var newFontSize = this.state.fontSize - 2;
      }

      YandexMetrica.sendEvent('changeProperty', { fontSize: newFontSize });

      if (newFontSize == 14) {
        var translate_icon_size = 18;
      }
      if (newFontSize == 16) {
        var translate_icon_size = 22;
      }
      if (newFontSize == 18) {
        var translate_icon_size = 24;
      }
      if (newFontSize == 20) {
        var translate_icon_size = 26;
      }
      if (newFontSize == 22) {
        var translate_icon_size = 28;
      }
      if (newFontSize == 24) {
        var translate_icon_size = 30;
      }

      AsyncStorage.getItem('themeReaderSettings').then((settings) => {
        settings = JSON.parse(settings);

        settings['fontSize'] = newFontSize;
        settings['translate_icon_size'] = translate_icon_size;

        new Storage().set('themeReaderSettings', JSON.stringify(settings)).then(() => {
          this.setState({
            fontSize: newFontSize,
            translate_icon_size: translate_icon_size,
            show_list: true,
          });
          readerStore.setThemeSettings({ fontSize: newFontSize, translate_icon_size: translate_icon_size });
        });
      });
    });
  }

  async checkBookmakScroll(event, paragraph_name) {
    if (this.props.stack.route.params.bookmark != undefined) {
      const layout = event.nativeEvent.layout;

      var paragraphsCoords = this.paragraphsCoords;
      paragraphsCoords[paragraph_name] = layout.y;
      this.paragraphsCoords = paragraphsCoords;

      if (Object.keys(this.paragraphsCoords).length == this.state.paragraphs.length) {
        if (this.flatListRef) {
          this.flatListRef.scrollToOffset({
            offset: parseInt(
              this.paragraphsCoords[this.props.stack.route.params.bookmark.paragraph]
            ),
            animated: false
          });
        }
        this.setPercent();
      }
    }
  }

  async goBookUp(book_id) {
    var sort_new_book = await new Storage().get('sort_new_book');
    if (sort_new_book == undefined) {
      sort_new_book = 'true';
    }
    if (sort_new_book == 'true') {
      var new_result = [];

      var books = await RNFS.readFile(file_root + '/' + BOOKS_FILENAME, 'utf8');
      books = JSON.parse(books);

      books.map((book) => {
        if (book.id == book_id) {
          new_result.unshift(book);
        } else {
          new_result.push(book);
        }
      });

      RNFS.writeFile(file_root + '/' + BOOKS_FILENAME, JSON.stringify(new_result), 'utf8');
    }
  }

  changeVoice(voiceId) {
    Tts.setDefaultVoice(voiceId);
    new Storage().set('ttsVoice', voiceId);
    this.setState({ ttsVoice: voiceId });
  }

  setWordInDictionary(word_in_dictionary) {
    this.setState({
      word_in_dictionary: word_in_dictionary
    });
  }

  renderParagraphItem({item}) {
    if (item._type === 'ad') {
      return (
        <View style={readerScreenStyles.adContainer}>
          <BannerView
            adUnitId={'R-M-1281415-12'}
            size="BANNER_300x250"
          />
        </View>
      );
    }
    return (
      <View onLayout={(event) => this.checkBookmakScroll(event, item.name)}>
        <Paragraph
          data={item}
          openTranslateSentence={(value) => this.translateSentence(value)}
          openTranslateWord={(o, tr, ts) => this.openTranslateWord(o, tr, ts)}
          openAuthModal={() => this.openAuthModal()}
          setBookmark={(value) => this.setBookmark(value)}
          current_user={this.props.root.state.current_user}
          page={this.state.page}
          book_name={this.book_name}
          book_name_en={this.book_name_en}
          book_id={this.props.stack.route.params.book_id}
          percent={this.state.percent}
          has_internet={this.props.root.state.has_internet}
        />
      </View>
    );
  }

  render() {
    return (
      <React.Fragment>

        {this.state.textColorTheme == '#ffffff' &&
          <StatusBar
            barStyle="light-content"
          />
        }
        {this.state.textColorTheme == '#000000' &&
          <StatusBar
            barStyle="dark-content"
          />
        }

        {(this.state.paragraphs == false) ? (
          <SafeAreaView style={{ flex: 1, backgroundColor: this.state.backgroundColorTheme }}>
            <TouchableOpacity onPress={() => this.props.stack.navigation.goBack()}>
              {this.state.textColorTheme == '#ffffff' &&
                <Image style={{ width: 30, height: 30, marginTop: 5, marginLeft: 10 }}
                  source={require('./app/images/header/arrow-left-white.png')} />
              }
              {this.state.textColorTheme == '#000000' &&
                <Image style={{ width: 30, height: 30, marginTop: 5, marginLeft: 10 }}
                  source={require('./app/images/header/arrow-left.png')} />
              }
            </TouchableOpacity>

            <ActivityIndicator style={{ flex: 1 }} size="large" color="#aaa" />
          </SafeAreaView>
        ) : (

          <SafeAreaView style={{ flex: 1, backgroundColor: this.state.backgroundColorTheme }}>
            <Modal
              animationType="slide"
              presentationStyle={'overFullScreen'}
              visible={this.state.auth_modal && this.props.root.state.current_user == false}>
              <Auth
                method={this.state.auth_method}
                modal={true}
                bookmark_info={true}
                close={() => this.setState({ auth_modal: false })}
              />
            </Modal>

            {this.state.showAdOpacity == true &&
              <View style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
                <ActivityIndicator style={{ flex: 1 }} size="large" color="#999" />
              </View>
            }

            {(this.state.showAdInfo && this.props.root.state.has_subscription == false) &&
              <TouchableOpacity style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '120%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }} onPress={() => this.closeAdInfo()}>
                <TouchableWithoutFeedback>
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

                      <TouchableOpacity onPress={() => this.showAd()} style={{ marginTop: 30, backgroundColor: '#75b641', height: 50, borderRadius: 10 }}>
                        <Text style={{ color: '#FFF', textAlign: 'center', lineHeight: 50, fontSize: 16 }}>Смотреть рекламу</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => this.props.stack.navigation.navigate('Subscription')} style={{ marginTop: 15, marginBottom: 30, backgroundColor: '#f05458', height: 50, borderRadius: 10 }}>
                        <Text style={{ color: '#FFF', textAlign: 'center', lineHeight: 50, fontSize: 16 }}>Приобрести PRO-версию</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </TouchableOpacity>
            }

            <ModalNoAd visible={this.state.showNoAd} close={() => this.closeNoAdInfo()} />

            <ModalFastLearning
              visible={this.state.showTraining}
              close={() => this.closeTraining()} />

            <ModalTranslateSentence
              has_subscription={this.props.root.state.has_subscription}
              translate={this.modalTranslateSentence}
              visible={this.state.showTranslateSentence}
              close={() => this.closeTranslateSentence()} />

            <ModalTranslateWord
              current_user={this.props.root.state.current_user}
              has_subscription={this.props.root.state.has_subscription}
              original={this.modalTranslateWordOriginal}
              transcription={this.modalTranslateWordTranscription}
              translate={this.modalTranslateWordTranslate}
              word_in_dictionary={this.state.word_in_dictionary}
              visible={this.state.showTranslateWord}
              has_internet={this.props.root.state.has_internet}
              close={() => this.closeTranslateWord()}
              openAuthModal={() => this.openAuthModal()}
              setWordInDictionary={(flag) => this.setWordInDictionary(flag)}
              openSubscription={() => this.props.stack.navigation.navigate('Subscription')}
            />

            <View style={{
              height: 40,
              backgroundColor: this.state.backgroundColorTheme,
              borderBottomWidth: 1,
              borderColor: this.state.secondColorTheme,
              flexDirection: 'row',
              position: 'relative',
              zIndex: 2,
            }}>
              <TouchableOpacity onPress={() => this.props.stack.navigation.goBack()}>
                {this.state.textColorTheme == '#ffffff' &&
                  <Image style={{ width: 30, height: 30, marginTop: 5, marginLeft: 10 }}
                    source={require('./app/images/header/arrow-left-white.png')} />
                }
                {this.state.textColorTheme == '#000000' &&
                  <Image style={{ width: 30, height: 30, marginTop: 5, marginLeft: 10 }}
                    source={require('./app/images/header/arrow-left.png')} />
                }
              </TouchableOpacity>

              {this.state.pages == 1 ? (
                <View style={{ flex: 1 }}></View>
              ) : (
                <Slider
                  style={{
                    flex: 1,
                    marginLeft: 5,
                    marginRight: 5,
                    width: Dimensions.get('window').width - 100
                  }}
                  value={this.state.percent}
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  minimumTrackTintColor="#fe4444"
                  maximumTrackTintColor={this.state.secondColorTheme}
                  thumbImage={require("./app/images/reader/sliderThumb.png")}
                  onValueChange={(value) => this.sliderValueChange(value)}
                  onSlidingComplete={() => this.onSlidingComplete()}
                />
              )}

              <TouchableWithoutFeedback onPress={() => this.openThemeSetting()}>
                <View>
                  {this.state.textColorTheme == '#ffffff' &&
                    <React.Fragment>
                      {this.state.showThemeSetting ? (
                        <Image
                          style={{ height: 30, width: 30, marginTop: 5, marginRight: 10 }}
                          resizeMode={'contain'}
                          source={require('./app/images/layouts/error_close.png')}
                        />
                      ) : (
                        <Image
                          style={{ height: 30, width: 30, marginTop: 5, marginRight: 10 }}
                          resizeMode={'contain'}
                          source={require('./app/images/header/property-white.png')}
                        />
                      )}
                    </React.Fragment>
                  }
                  {this.state.textColorTheme == '#000000' &&
                    <React.Fragment>
                      {this.state.showThemeSetting ? (
                        <Image
                          style={{ height: 30, width: 30, marginTop: 5, marginRight: 10 }}
                          resizeMode={'contain'}
                          source={require('./app/images/home/settings-close.png')}
                        />
                      ) : (
                        <Image
                          style={{ height: 30, width: 30, marginTop: 5, marginRight: 10 }}
                          resizeMode={'contain'}
                          source={require('./app/images/header/property.png')}
                        />
                      )}
                    </React.Fragment>
                  }
                </View>
              </TouchableWithoutFeedback>

              <ReaderSettings
                visible={this.state.showThemeSetting}

                fontSize={this.state.fontSize}
                changeFontSize={(value) => this.changeFontSize(value)}

                textAlign={this.state.textAlign}
                textAlignChange={() => this.textAlignChange()}

                backgroundColorTheme={this.state.backgroundColorTheme}
                changeColorTheme={(backgroundColor, textColor, secondColor) => this.changeColorTheme(backgroundColor, textColor, secondColor)}

                fontFamily={this.state.fontFamily}
                chanageFontFamily={(fontFamily) => this.chanageFontFamily(fontFamily)}

                ttsVoice={this.state.ttsVoice}
                changeVoice={(voiceId) => this.changeVoice(voiceId)}
              />

            </View>

            <View style={readerScreenStyles.readerContainer}>
              {this.state.show_list &&
                <FlatList
                  ref={(ref) => this.flatListRef = ref}
                  data={this.state.paragraphs}
                  keyExtractor={(item) => item._type === 'ad' ? item._key : 'p_' + item.name}
                  renderItem={(itemInfo) => this.renderParagraphItem(itemInfo)}
                  initialNumToRender={5}
                  maxToRenderPerBatch={3}
                  windowSize={7}
                  onScroll={(event) => this.onScroll(event)}
                  onScrollEndDrag={(event) => this.onScrollEndDrag(event)}
                  scrollEventThrottle={8}
                  ListFooterComponent={<View style={readerScreenStyles.footerSpacer} />}
                  style={{ flex: 1 }}
                />
              }
            </View>

            <View style={[readerScreenStyles.footerNav, { borderTopWidth: 1, borderTopColor: this.state.secondColorTheme }]}>

              {this.state.page > 1 &&
                <TouchableOpacity onPress={() => this.prevPage()} style={readerScreenStyles.navButton}>
                  {this.state.textColorTheme == '#ffffff' &&
                    <Image style={readerScreenStyles.navArrow}
                      source={require('./app/images/header/arrow-left-white.png')} />
                  }
                  {this.state.textColorTheme == '#000000' &&
                    <Image style={readerScreenStyles.navArrow}
                      source={require('./app/images/header/arrow-left.png')} />
                  }
                </TouchableOpacity>
              }
              {this.state.page == 1 &&
                <React.Fragment>
                  {this.state.textColorTheme == '#ffffff' &&
                    <Image style={{ width: 30, height: 30, opacity: 0.3, margin: 10 }}
                      source={require('./app/images/header/arrow-left-white.png')} />
                  }
                  {this.state.textColorTheme == '#000000' &&
                    <Image style={{ width: 30, height: 30, opacity: 0.3, margin: 10 }}
                      source={require('./app/images/header/arrow-left.png')} />
                  }

                </React.Fragment>
              }


              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Text style={{ color: this.state.textColorTheme, lineHeight: 30, fontSize: 16 }}> {this.state.page} / {this.state.pages}</Text>
              </View>

              {this.state.page < this.state.pages &&
                <TouchableOpacity onPress={() => this.nextPage()} style={{ padding: 10 }}>
                  {this.state.textColorTheme == '#ffffff' &&
                    <Image style={{ width: 30, height: 30 }}
                      source={require('./app/images/header/arrow-right-white.png')} />
                  }
                  {this.state.textColorTheme == '#000000' &&
                    <Image style={{ width: 30, height: 30 }}
                      source={require('./app/images/header/arrow-right.png')} />
                  }
                </TouchableOpacity>
              }
              {this.state.page == this.state.pages &&
                <React.Fragment>
                  {this.state.textColorTheme == '#ffffff' &&
                    <Image style={{ width: 30, height: 30, opacity: 0.3, margin: 10 }}
                      source={require('./app/images/header/arrow-right-white.png')} />
                  }
                  {this.state.textColorTheme == '#000000' &&
                    <Image style={{ width: 30, height: 30, opacity: 0.3, margin: 10 }}
                      source={require('./app/images/header/arrow-right.png')} />
                  }

                </React.Fragment>
              }

            </View>


          </SafeAreaView>

        )}
      </React.Fragment>
    )
  }
};
