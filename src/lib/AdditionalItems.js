const ArrayKeyword = require( './ArrayKeyword')

module.exports = class AdditionalItems extends ArrayKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value !== 'boolean' && typeof value !== 'object') {
      throw new Error('value must be a boolean value or a Schema instance')
    }
    this._value = value
  }

  json(context = {}) {
    context.additionalItems = this.value.json ? this.value.json({}) : this.value
    return context
  }
}