const Keyword = require( './Keyword')

module.exports = class Not extends Keyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value != 'object') {
      throw new Error('value must be an object')
    }
    this._value = value
  }

  json(context = {}) {
    context.not = this.value.json ? this.value.json({}) : this.value
    return context
  }
}