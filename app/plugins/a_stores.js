// ==================== AppStore ====================
class AppStore {
  has_internet = true;
  has_subscription = false;
  subscription_info = {};
  current_user = false;
  confirm_conditions = true;
  books_percents = {};
  error_show = false;
  error_title = '';
  error_description = '';
  type_payment = Platform.OS === 'ios' ? 'by_store' : 'by_yoo_kassa';
  show_subsription = false;

  constructor() {
    makeAutoObservable(this);
    this._notification_timer = null;
  }

  setInternet(value) { this.has_internet = value; }
  setSubscription(value) { this.has_subscription = value; }
  setSubscriptionInfo(info) { this.subscription_info = info; }
  setCurrentUser(user) { this.current_user = user; }
  setConfirmConditions(value) { this.confirm_conditions = value; }
  setBooksPercents(percents) { this.books_percents = percents; }
  setTypePayment(value) { this.type_payment = value; }
  setShowSubscription(value) { this.show_subsription = value; }

  showError(title, description) {
    this.error_show = true;
    this.error_title = title;
    this.error_description = description;
    console.log(title + ' ' + description);
    clearTimeout(this._notification_timer);
    this._notification_timer = setTimeout(() => {
      runInAction(() => { this.error_show = false; });
    }, 3000);
  }

  closeError() {
    this.error_show = false;
  }

  clearErrorTimer() {
    clearTimeout(this._notification_timer);
  }
}
const appStore = new AppStore();

// ==================== ReaderStore ====================
class ReaderStore {
  fontSize = 18;
  fontFamily = 'LibreBaskerville-Regular';
  textAlign = 'flex-start';
  translate_icon_size = 24;
  backgroundColorTheme = '#ffffff';
  textColorTheme = '#000000';
  secondColorTheme = '#bbb';
  bookmark = false;
  page = '';
  ttsVoice = false;
  list_words = null;

  constructor() {
    makeAutoObservable(this);
  }

  setThemeSettings(settings) {
    this.fontSize = settings.fontSize;
    this.fontFamily = settings.fontFamily;
    this.textAlign = settings.textAlign;
    this.translate_icon_size = settings.translate_icon_size;
    this.backgroundColorTheme = settings.backgroundColorTheme;
    this.textColorTheme = settings.textColorTheme;
    this.secondColorTheme = settings.secondColorTheme;
  }

  setBookmark(value) { this.bookmark = value; }
  setPage(value) { this.page = value; }
  setTtsVoice(value) { this.ttsVoice = value; }
  setListWords(words) { this.list_words = words; }
  clearListWords() { this.list_words = null; }
}
const readerStore = new ReaderStore();

// ==================== HomeStore ====================
class HomeStore {
  open_property = false;

  constructor() {
    makeAutoObservable(this);
  }

  setOpenProperty(value) { this.open_property = value; }
}
const homeStore = new HomeStore();
