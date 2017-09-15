const ObjectKeyword = require( './ObjectKeyword')

module.exports = class AdditionalProperties extends ObjectKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value !== 'boolean' && typeof value !== 'object') {
      throw new Error('value must be a boolean or an object')
    }
    this._value = value
  }

  json(context = {}) {
    context.additionalProperties = this.value.json ? this.value.json({}) : this.value
    return context
  }
}

