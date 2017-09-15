const ArrayKeyword = require( './ArrayKeyword')

module.exports = class MaxItems extends ArrayKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (value >= 0 && Number.isInteger(value)) {
      this._value = value
    } else {
      throw new Error('value must be an integer and greater than or equal to 0')
    }
  }

  json(context = {}) {
    context.maxItems = this.value
    return context
  }
}