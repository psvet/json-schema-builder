const _ = require( 'lodash')
const { writeFile, writeFileSync } = require( 'fs')
const { join } = require( 'path')

const AdditionalItems = require( './AdditionalItems')
const AdditionalProperties = require( './AdditionalProperties')
const AllOf = require( './AllOf')
const AnyOf = require( './AnyOf')
const Builder = require( './Builder')
const Default = require( './Default')
const Definitions = require( './Definitions')
const Dependencies = require( './Dependencies')
const Enum = require( './Enum')
const ExclusiveMaximum = require( './ExclusiveMaximum')
const ExclusiveMinimum = require( './ExclusiveMinimum')
const Format = require( './Format')
const Items = require( './Items')
const Keyword = require( './Keyword')
const Maximum = require( './Maximum')
const MaxItems = require( './MaxItems')
const MaxLength = require( './MaxLength')
const MaxProperties = require( './MaxProperties')
const Minimum = require( './Minimum')
const MinItems = require( './MinItems')
const MinLength = require( './MinLength')
const MinProperties = require( './MinProperties')
const MultipleOf = require( './MultipleOf')
const Not = require( './Not')
const OneOf = require( './OneOf')
const Pattern = require( './Pattern')
const PatternProperties = require( './PatternProperties')
const Properties = require( './Properties')
const RefKeyword = require( './RefKeyword')
const Required = require( './Required')
const Type = require( './Type')
const UniqueItems = require( './UniqueItems')

function isDefined(value) {
  return typeof value !== 'undefined'
}

module.exports = class Schema extends Builder {

  constructor() {
    super()
  }

  get keywords() {
    if (!this._keywords) this._keywords = []
    return this._keywords
  }

  addKeyword(keyword) {
    this.keywords.push(keyword)
  }

  getKeyword(Class) {
    return _.find(this.keywords, keyword => keyword instanceof Class)
  }

  getKeywordValue(Class, defaultValue) {
    return _.result(_.find(this.keywords, keyword => keyword instanceof Class), 'value', defaultValue)
  }

  type() {
    if (arguments.length) {
      this.addKeyword(new Type(...arguments))
      return this
    }

    return this.getKeywordValue(Type)
  }

  // type convenience methods
  boolean() { return this.type('boolean') }

  integer() { return this.type('integer') }

  number() { return this.type('number') }

  string() { return this.type('string') }

  object() { return this.type('object') }

  array() { return this.type('array') }

  null() { return this.type('null') }

  required() {
    if (arguments.length) {
      this.addKeyword(new Required(...arguments))
      return this
    }

    return this.getKeywordValue(Required)
  }

  enum() {
    if (arguments.length) {
      this.addKeyword(new Enum(...arguments))
      return this
    }

    return this.getKeywordValue(Enum)
  }

  properties() {
    if (arguments.length) {
      this.addKeyword(new Properties(...arguments))
      return this
    }

    return this.getKeywordValue(Properties)
  }

  property(name, value, required) {
    if (isDefined(name)) {
      if (typeof name === 'object') {
        required = value
        value = undefined
        Object.keys(name).forEach(key => {
          this.property(key, name[key], required)
        })
        return this
      }
      
      const properties = this.getKeyword(Properties)
      if (properties) {
        properties.add(name, value)
      } else {
        const prop = {}
        prop[name] = value || {}
        this.properties(prop)
      }
      
      if (required) {
        if (this.required()) {
          this.required().push(name)
        } else {
          this.required([name])
        }
      }

      return this
    }
    
    const props = this.properties()
    if (props) {
      return props[name]
    }
  }

  patternProperties() {
    if (arguments.length) {
      this.addKeyword(new PatternProperties(...arguments))
      return this
    }

    return this.getKeywordValue(PatternProperties)
  }

  patternProperty(name, value) {
    if (isDefined(name)) {
      if (typeof name == 'object') {
        Object.keys(name).forEach(key => {
          this.patternProperty(key, name[key])
        })
        return this
      }

      const properties = this.getKeyword(PatternProperties)
      if (properties) {
        properties.add(name, value)
      } else {
        const prop = {}
        prop[name] = value || {}
        this.patternProperties(prop)
      }

      return this
    }

    const props = this.patternProperties()
    if (props) {
      return props[name]
    }
  }

  additionalProperties() {
    if (arguments.length) {
      this.addKeyword(new AdditionalProperties(...arguments))
      return this
    }

    return this.getKeywordValue(AdditionalProperties)
  }

  allOf() {
    if (arguments.length) {
      this.addKeyword(new AllOf(...arguments))
      return this
    }

    return this.getKeywordValue(AllOf)
  }

  anyOf() {
    if (arguments.length) {
      this.addKeyword(new AnyOf(...arguments))
      return this
    }

    return this.getKeywordValue(AnyOf)
  }

  oneOf() {
    if (arguments.length) {
      this.addKeyword(new OneOf(...arguments))
      return this
    }

    return this.getKeywordValue(OneOf)
  }

  multipleOf(value) {
    if (value) {
      this.addKeyword(new MultipleOf(value))
      return this
    }

    return this.getKeywordValue(MultipleOf)
  }

  maximum() {
    if (arguments.length) {
      this.addKeyword(new Maximum(...arguments))
      return this
    }

    return this.getKeywordValue(Maximum)
  }

  exclusiveMaximum() {
    if (arguments.length) {
      this.addKeyword(new ExclusiveMaximum(...arguments))
      return this
    }

    return this.getKeywordValue(ExclusiveMaximum)
  }

  minimum() {
    if (arguments.length) {
      this.addKeyword(new Minimum(...arguments))
      return this
    }

    return this.getKeywordValue(Minimum)
  }

  exclusiveMinimum() {
    if (arguments.length) {
      this.addKeyword(new ExclusiveMinimum(...arguments))
      return this
    }

    return this.getKeywordValue(ExclusiveMinimum)
  }

  not() {
    if (arguments.length) {
      this.addKeyword(new Not(...arguments))
      return this
    }

    return this.getKeywordValue(Not)
  }

  maxProperties() {
    if (arguments.length) {
      this.addKeyword(new MaxProperties(...arguments))
      return this
    }

    return this.getKeywordValue(MaxProperties)
  }

  minProperties() {
    if (arguments.length) {
      this.addKeyword(new MinProperties(...arguments))
      return this
    }

    return this.getKeywordValue(MaxProperties)
  }

  additionalItems() {
    if (arguments.length) {
      this.addKeyword(new AdditionalItems(...arguments))
      return this
    }

    return this.getKeywordValue(AdditionalItems)
  }

  items() {
    if (arguments.length) {
      this.addKeyword(new Items(...arguments))
      return this
    }

    return this.getKeywordValue(Items)
  }

  maxItems() {
    if (arguments.length) {
      this.addKeyword(new MaxItems(...arguments))
      return this
    }

    return this.getKeywordValue(MaxItems)
  }

  minItems() {
    if (arguments.length) {
      this.addKeyword(new MinItems(...arguments))
      return this
    }

    return this.getKeywordValue(MinItems)
  }

  uniqueItems() {
    if (arguments.length) {
      this.addKeyword(new UniqueItems(...arguments))
      return this
    }

    return this.getKeywordValue(UniqueItems)
  }

  maxLength() {
    if (arguments.length) {
      this.addKeyword(new MaxLength(...arguments))
      return this
    }

    return this.getKeywordValue(MaxLength)
  }

  minLength() {
    if (arguments.length) {
      this.addKeyword(new MinLength(...arguments))
      return this
    }

    return this.getKeywordValue(MinLength)
  }

  pattern() {
    if (arguments.length) {
      this.addKeyword(new Pattern(...arguments))
      return this
    }

    return this.getKeywordValue(Pattern)
  }

  definitions() {
    if (arguments.length) {
      this.addKeyword(new Definitions(...arguments))
      return this
    }

    return this.getKeywordValue(Definitions)
  }

  dependencies() {
    if (arguments.length) {
      this.addKeyword(new Dependencies(...arguments))
      return this
    }

    return this.getKeywordValue(Dependencies)
  }

  $ref() {
    if (arguments.length) {
      this.addKeyword(new RefKeyword(...arguments))
      return this
    }

    return this.getKeywordValue(RefKeyword)
  }

  json(context) {
    // console.log('here', context)
    context = context || {}
    this.keywords.forEach(keyword => {
      keyword.json(context)
    })

    return context
  }

	format() {
		if (arguments.length) {
			this.addKeyword(new Format(...arguments))
			return this
		}

		return this.getKeywordValue(Format)
	}

	default() {
		if (arguments.length) {
			this.addKeyword(new Default(...arguments))
			return this
		}

		return this.getKeywordValue(Default)
	}


  save() {
    const context = typeof arguments[0] == 'object' ? arguments[0] : null
    const callback = arguments.length && typeof arguments[arguments.length - 1] == 'function' ? arguments[arguments.length - 1] : null

    if (callback && arguments.length == 1 || !arguments.length) throw new Error('missing filename argument')

    const begin = context ? 1 : 0
    const end = callback ? arguments.length - 1 : arguments.length
    const args = Array.prototype.slice.call(arguments, begin, end)
    const pathname = join(...args)
    const json = JSON.stringify(this.json(context), null, 2)

    if (!callback) {
      return new Promise((resolve, reject) => {
        writeFile(pathname, json, 'utf8', (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    }
    writeFile(pathname, json, 'utf8', callback)
  }

  saveSync() {
    const context = typeof arguments[0] == 'object' ? arguments[0] : null
    if (!arguments.length) throw new Error('missing filename argument')

    const begin = context ? 1 : 0
    const end = arguments.length
    const args = Array.prototype.slice.call(arguments, begin, end)
    const pathname = join(...args)
    const json = JSON.stringify(this.json(context), null, 2)

    writeFileSync(pathname, json, 'utf8')
  }
}

