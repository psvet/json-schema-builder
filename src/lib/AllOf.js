const Keyword = require( './Keyword')
const Schema = require( './Schema')

module.exports = class AllOf extends Keyword {
  constructor(value) {
    super()
    this.value = arguments.length > 1 ? Array.prototype.slice.call(arguments) : value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (!Array.isArray(value) || !value.length) {
      throw new Error('value must be an array with at least one element')
    }

    value.forEach(elem => {
      if (typeof elem !== 'object') {
        throw new Error('value in allOf array must be a Schema instance')
      }
    })

    this._value = value
  }

  json(context = {}) {
    if (this.value) {
      context.allOf = this.value.map(elem => elem.json ? elem.json() : elem)
    }
    return context
  }
}