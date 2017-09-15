const Keyword = require( './Keyword')
const _ = require( 'lodash')

const primitiveTypes = [
  'array',
  'object',
  'boolean',
  'integer',
  'number',
  'string',
  'null'
]

module.exports = class Type extends Keyword {
  constructor(value) {
    super()
    this.value = arguments.length > 1 ? Array.prototype.slice.call(arguments) : value
  }

  set value(value) {
    if (typeof value != 'string' && !Array.isArray(value)) {
      throw new Error('value must be a string or an array of strings')
    }

    if (Array.isArray(value)) {
      value.forEach(t => {
        if (!_.includes(primitiveTypes, t)) {
          throw new Error('value array elements must be a string value that specifies a valid value: ' + t)
        }
      })
    }

    this._value = value
  }

  get value() {
    return this._value
  }

  json(context = {}) {
    context.type = this.value
    return context
  }
}
