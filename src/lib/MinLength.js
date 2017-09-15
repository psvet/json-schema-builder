const StringKeyword = require( './StringKeyword')

module.exports = class MinLength extends StringKeyword {
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
    context.minLength = this.value
    return context
  }
}