const NumberKeyword = require( './NumberKeyword')

module.exports = class MultipleOf extends NumberKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  set value(value) {
    if (typeof value != 'number' || value <= 0) {
      throw new Error('value must be a number greater than 0')
    }

    this._value = value
  }

  get value() {
    return this._value
  }

  json(context = {}) {
    context.multipleOf = this.value
    return context
  }
}