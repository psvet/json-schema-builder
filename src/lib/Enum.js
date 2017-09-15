const Keyword = require( './Keyword')

module.exports = class Enum extends Keyword {
  constructor(value) {
    super()

    if (!Array.isArray(value)) {
      value = Array.prototype.slice.call(arguments)
    }
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (!Array.isArray(value)) {
      value = Array.prototype.slice.call(arguments)
    }

    if (value.length) {
      this._value = value
    } else {
      throw new Error('value must be an array with at least one element')
    }
  }

  json(context = {}) {
    context.enum = this.value
    return context
  }
}

