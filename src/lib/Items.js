const ArrayKeyword = require( './ArrayKeyword')

module.exports = class Items extends ArrayKeyword {
  constructor(value) {
    super()
    this.value = arguments.length > 1 ? Array.prototype.slice.call(arguments) : value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value !== 'object') {
      throw new Error('value must be an array or a Schema instance')
    }
    if (Array.isArray(value)) {
      value.forEach(v => {
        if (typeof v !== 'object') {
          throw new Error('array values must be objects')
        }
      })
    }
    this._value = value
  }

  json(context = {}) {
    if (this.value) {
      let props

      if (this.value.json) {
        props = this.value.json()
      } else {
        props = this.value.map(elem => elem.json ? elem.json() : elem)
      }

      context.items = props
    }

    return context
  }
}