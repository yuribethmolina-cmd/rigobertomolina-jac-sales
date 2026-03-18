"use strict";

class QuickLRU {
  constructor(options = {}) {
    const { maxSize = 1000 } = options;
    if (!(maxSize && maxSize > 0)) {
      throw new TypeError("`maxSize` must be a number greater than 0");
    }

    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get size() {
    return this.cache.size;
  }

  _touch(key, value) {
    this.cache.delete(key);
    this.cache.set(key, value);
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this._touch(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, value);

    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    return this;
  }

  has(key) {
    return this.cache.has(key);
  }

  peek(key) {
    return this.cache.get(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  resize(newSize) {
    if (!(newSize && newSize > 0)) {
      throw new TypeError("`maxSize` must be a number greater than 0");
    }

    this.maxSize = newSize;

    while (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  *keys() {
    yield* this.cache.keys();
  }

  *values() {
    yield* this.cache.values();
  }

  *entries() {
    yield* this.cache.entries();
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}

module.exports = QuickLRU;
module.exports.default = QuickLRU;
