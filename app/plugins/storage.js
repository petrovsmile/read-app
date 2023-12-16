class Storage {
  async get(key, default_value) {
    var value = await AsyncStorage.getItem(key);
    if (value == undefined) {
      value = default_value;
    }
    return value;
  }

  async set(key, value) {
    if(value == undefined){
      console.log(key);
      return false;
    }

    var value = await AsyncStorage.setItem(key, value);
    return value;
  }

  async remove(key) {
    await AsyncStorage.removeItem(key);
  }
}