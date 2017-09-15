const ObjectKeyword = require( './ObjectKeyword')

module.exports = class Properties extends ObjectKeyword {
  constructor(value) {
    super()
    this.value = value
  }

  get value() {
    return this._value
  }

  set value(value) {
    if (typeof value !== 'object') throw new Error('value must be an object')
    this._value = value
  }

  add(name, value = {}) {
    if (typeof name == 'object') {
      Object.keys(name).forEach(key => {
        this.add(key, name[key])
      })
      return
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
    // console.log('here', context)
    if (this.value) {
      context.properties = Object.keys(this.value).reduce((acc, key) => {
        const value = this.value[key]
        acc[key] = value.json ? value.json({}) : value
        return acc
      }, {})
    }

    return context
  }
}
