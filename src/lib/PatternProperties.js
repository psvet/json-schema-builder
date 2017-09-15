const ObjectKeyword = require( './ObjectKeyword')

module.exports = class PatternProperties extends ObjectKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value == 'object') {
      this._value = value
    } else {
      throw new Error('value must be an object')
    }
  }

  add(name, value) {
    if (typeof name == 'object') {
      Object.keys(name).forEach(key => {
        this.add(key, name[key])
      })
      return
    }

    if (typeof name != 'string') {
      throw new Error('name must be a string and should be a valid regular expression')
    }

    if (typeof value != 'object') {
      throw new Error('value must be an object')
    }

    if (this.value) {
      this.value[name] = value
    } else {
      const prop = {}
      prop[name] = value
      this.value = prop
    }
  }

  json(context = {}) {
    if (this.value) {
      context.patternProperties = Object.keys(this.value).reduce((acc, key) => {
        const value = this.value[key]
        acc[key] = value.json ? value.json() : value
        return acc
      }, {})
    }
    return context
  }
}
