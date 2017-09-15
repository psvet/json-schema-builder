const Keyword = require( './Keyword')

module.exports = class OneOf extends Keyword {
  constructor(value) {
    super()
    this.value = arguments.length > 1 ? Array.prototype.slice.call(arguments) : value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (!Array.isArray(value) || !value.length) {
      throw new Error('value must be an array of values with at least one element')
    }

    value.forEach(elem => {
      if (typeof elem != 'object') {
        throw new Error('array values must be objects')
      }
    })

    this._value = value
  }

  json(context = {}) {
    if (this.value) {
      context.oneOf = this.value.map(elem => elem.json ? elem.json() : elem)
    }
    return context
  }

}
