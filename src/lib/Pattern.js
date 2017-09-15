const StringKeyword = require( './StringKeyword')

module.exports = class Pattern extends StringKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value === 'string') {
      this._value = value
    } else {
      throw new Error('value must be a string and should be a valid regular expression')
    }
  }

  json(context = {}) {
    context.pattern = this.value
    return context
  }
}