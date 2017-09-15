const ObjectKeyword = require( './ObjectKeyword')
const { uniq } = require( 'lodash')

module.exports = class Dependencies extends ObjectKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value !== 'object') throw new Error('value must be an object')
    Object.keys(value).forEach(key => {
      if (typeof value[key] !== 'object') {
        throw new Error('value property must be array or object')
      }
      else if (Array.isArray(value[key])) {
        if (!value[key].length) throw new Error('array must have at least one item')
        if (uniq(value[key]).length != value[key].length) throw new Error('array items must be unique')
        value[key].forEach(elem => {
          if (typeof elem !== 'string') throw new Error('array items must strings')
        })
      }
    })
    this._value = value
  }

  json(context = {}) {
    if (this.value) {
      context.dependencies = Object.keys(this.value).reduce((acc, key) => {
        const value = this.value[key]
        acc[key] = value.json ? value.json({}) : value
        return acc
      }, {})
    }

    return context
  }
}