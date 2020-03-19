class Cache {
  constructor() {
    this.store = {}
  }

  set(key, value, expire = 5) {
    this.store[key] = {
      value,
      expire: Date.now() + expire * 1e3
    }
    return value
  }

  get(key) {
    if (this.store[key] && this.store[key].expire >= Date.now()) {
      return this.store[key].value
    }

    return null
  }
}

module.exports = new Cache()
