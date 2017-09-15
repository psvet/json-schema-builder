const NumberKeyword = require( './NumberKeyword')

module.exports = class Minimum extends NumberKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  set value(value) {
    if (typeof value != 'number') {
      throw new Error('value must be a number')
    }

    this._value = value
  }

  get value() {
    return this._value
  }

  json(context = {}) {
    context.minimum = this.value
    return context
  }
}