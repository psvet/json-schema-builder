const ArrayKeyword = require( './ArrayKeyword')

module.exports = class UniqueItems extends ArrayKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value == 'boolean') {
      this._value = value
    } else {
      throw new Error('value must be a boolean value')
    }
  }

  json(context = {}) {
    context.uniqueItems = this.value
    return context
  }
}