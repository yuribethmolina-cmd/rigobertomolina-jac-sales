"use strict";

class QuickLRU {
  constructor(options = {}) {
    this.maxSize = options.maxSize || Infinity;
    this.cache = new Map();
  }
  get(key) { return this.cache.get(key); }
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
    return this;
  }
  has(key) { return this.cache.has(key); }
  delete(key) { return this.cache.delete(key); }
  clear() { this.cache.clear(); }
  get size() { return this.cache.size; }
  *keys() { yield* this.cache.keys(); }
  *values() { yield* this.cache.values(); }
  *entries() { yield* this.cache.entries(); }
  [Symbol.iterator]() { return this.entries(); }
}

module.exports = QuickLRU;
