class Paragraph extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      sentences: false,
      paragraph_translate: [],
    }
  }

  async componentDidMount() {
    var paragraph_translate = [];
    for (const s in this.props.data['sentences']) {
      paragraph_translate.push(this.props.data['sentences'][s]['tr']);
    }

    this.setState({
      sentences: this.props.data['sentences'],
      paragraph_translate: paragraph_translate,
    });
  }

  async addBookmark() {
    if (this.props.current_user == false) {
      this.props.openAuthModal();
    } else {
      YandexMetrica.sendEvent('addBookmark', { bookmark: 'bookmark_' + this.props.book_id + '_' + this.props.data['name'] });

      if (root_reader.state.bookmark == this.props.data['name']) {
        this.props.setBookmark(false);

        this.deleteBookmarkKey('bookmark_' + this.props.book_id);

        new Storage().remove('bookmark_' + this.props.book_id);

        await new Request('/api/v1/bookmarks', {
          book_id: this.props.book_id,
          user_id: this.props.current_user.id
        }, {
          desciption_error: 'Закладка удалена только с этого устройства.'
        }).delete();
      } else {
        await new Storage().set('bookmark_' + this.props.book_id, JSON.stringify({
          book_id: this.props.book_id,
          book_name: this.props.book_name,
          page: this.props.page,
          paragraph: this.props.data['name'],
          offline: !this.props.has_internet
        }));
        await this.addBookmarkToKeys('bookmark_' + this.props.book_id);

        await this.props.setBookmark(this.props.data['name']);

        await new Request('/api/v1/bookmarks', {
          book_id: this.props.book_id,
          user_id: this.props.current_user.id,
          page: this.props.page,
          paragraph: this.props.data['name']
        }, {
          desciption_error: 'Закладка добавлена только на этом устройстве.'
        }).post();
      }

    }
  }

  async addBookmarkToKeys(value) {
    bookmarks_keys = await new Storage().get('bookmarks_keys');
    if (bookmarks_keys == undefined) {
      bookmarks_keys = []
    } else {
      bookmarks_keys = JSON.parse(bookmarks_keys);

      var index = bookmarks_keys.indexOf(value);
      if (index > -1) {
        bookmarks_keys.splice(index, 1);
      }
    }

    bookmarks_keys.unshift(value);

    new Storage().set('bookmarks_keys', JSON.stringify(bookmarks_keys));
  }

  async deleteBookmarkKey(value) {
    bookmarks_keys = await new Storage().get('bookmarks_keys');
    bookmarks_keys = JSON.parse(bookmarks_keys);

    var index = bookmarks_keys.indexOf(value);
    if (index > -1) {
      bookmarks_keys.splice(index, 1);
    }

    new Storage().set('bookmarks_keys', JSON.stringify(bookmarks_keys));
  }

  translateWord(word_id) {
    word_id = parseInt(word_id);

    var word = list_words[word_id];

    YandexMetrica.sendEvent('translateWord', { word: word });

    var transcription = word.ts;

    if (word != undefined) {
      if (word.ts != null) {
        if (word.ts.length == 0) {
          transcription = null;
        }
      }

      this.props.openTranslateWord(
        word.o,
        word.tr,
        transcription,
      );
    }
  }

  translateText(translate) {
    YandexMetrica.sendEvent('translateText', { platform: Platform.OS });

    this.props.openTranslateSentence(translate);
  }

  render() {

    return (

      <React.Fragment>
        {(root_reader.state.page == 1 && this.props.data['name'] == 1) &&
          <View style={{ marginTop: 20, paddingLeft: 40, paddingRight: 20 }}>
            <Text style={{ fontSize: 35, fontFamily: 'LibreBaskerville-Regular', color: root_reader.state.textColorTheme }}>{this.props.book_name_en}</Text>
          </View>
        }
        <View style={{ marginTop: 15, flexDirection: "row" }}>
          <TouchableOpacity onPress={() => this.addBookmark(this.props.data['name'])} style={{ marginTop: 5, paddingRight: 5, paddingLeft: 15 }}>
            <Text style={[{ fontSize: 18, fontFamily: 'Times', textAlign: 'center', color: root_reader.state.secondColorTheme }, (root_reader.state.bookmark == this.props.data['name']) && { color: '#f05458' }]}>{this.props.data['name']}</Text>
            {root_reader.state.bookmark == this.props.data['name'] ? (
              <Image
                style={{ height: 20, width: 15, marginTop: 5 }}
                source={require('./app/images/reader/bookmark-active.png')}
              />
            ) : (
              <Image
                style={{ height: 20, width: 15, marginTop: 5 }}
                source={require('./app/images/reader/bookmark.png')}
              />
            )}

          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: "row", flexWrap: 'wrap', justifyContent: root_reader.state.textAlign, marginRight: 15 }}>
            <View style={{ width: 15 }}></View>
            {this.props.data['sentences'].map((sentence, index) =>
              <React.Fragment key={index}>
                {sentence['b'].map((block, index) => {

                  var past_value = "";
                  if (sentence['b'][index - 1] != undefined) {
                    past_value = sentence['b'][index - 1]['v'];
                  }

                  return (
                    <React.Fragment key={index} >
                      {block['w'] != undefined &&
                        <TouchableWithoutFeedback onPress={() => this.translateWord(block['w'])}>
                          <View style={[past_value != '"' && past_value != "'" && { marginLeft: 10 }, { borderBottomWidth: 2, borderBottomColor: root_reader.state.secondColorTheme, marginTop: 5 }]}>
                            <Text style={{ fontSize: root_reader.state.fontSize, fontFamily: root_reader.state.fontFamily, color: root_reader.state.textColorTheme }}>{block['v']}</Text>
                          </View>
                        </TouchableWithoutFeedback>
                      }
                      {block['w'] == undefined &&
                        <Text style={{ marginLeft: 3, marginTop: 5, fontSize: root_reader.state.fontSize, fontFamily: root_reader.state.fontFamily, color: root_reader.state.textColorTheme }}>{block['v']}</Text>
                      }
                    </React.Fragment>
                  );
                }
                )}

                {this.props.data['sentences'].length > 1 &&
                  <TouchableWithoutFeedback onPress={() => this.translateText(sentence['tr'])}>
                    <Image
                      style={{ width: root_reader.state.translate_icon_size, height: root_reader.state.translate_icon_size, marginTop: 5, marginLeft: 5 }}
                      source={require('./app/images/reader/sentence-translate.png')}
                    />
                  </TouchableWithoutFeedback>
                }

              </React.Fragment>
            )}


            <TouchableWithoutFeedback onPress={() => this.translateText(this.state.paragraph_translate)}>
              <Image
                style={{ width: root_reader.state.translate_icon_size, height: root_reader.state.translate_icon_size, marginTop: 5, marginLeft: 5 }}
                source={require('./app/images/reader/paragraph-translate.png')}
              />
            </TouchableWithoutFeedback>


          </View>
        </View>
      </React.Fragment>
    );
  }
}