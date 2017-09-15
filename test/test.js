const assert = require( 'assert')
const testSuite = require( 'json-schema-test-suite')
const _ = require( 'lodash')
const { isEqual, stringify } = require('./helpers')
const json = require( '../src')
const { mkdirSync } = require( 'fs')
const { join } = require( 'path')
const del = require( 'del')

const draft4 = testSuite.draft4()

const verbose = false

function print() {
  if (verbose) {
    if (typeof arguments[0] == 'object') {
      console.log(JSON.stringify(arguments[0], null, 2))
    } else {
      console.log(...arguments)
    }
  }
}

function getTestSection(name, description) {
  const group = _.findWhere(draft4, { name: name })
  if (!group) throw new Error("can't find schema for: " + name)
  const section = _.findWhere(group.schemas, { description: description })
  if (!section) throw new Error("can't find section for: " + name + ' => ' + description)
  return section
}

function getSchema(name, description) {
  return getTestSection(name, description).schema
}

function test(name, description, builderFn) {
  it(name + ': ' + description, function () {
    try {
      const expected = getSchema(name, description)
      const actual = builderFn().json()

      if (!isEqual(actual, expected) || verbose) {
        print('==============================')
        print('expected =>')
        print(expected)
        print('------------------------------')
        print('actual =>')
        print(actual)
      }

      assert(isEqual(actual, expected))
    } catch (err) {
      print('==============================')
      print('Uncaught error for: %s => %s', name, description)
      throw err
    }
  })
}

test.skip = function () {
  it.skip(arguments[0] + ' => ' + arguments[1], function () {})
}

describe('Tests based on standard JSON Schema Test Suite', () => {
  describe('generic keywords (any instance type)', () => {
    describe('enum', () => {
      test('enum', 'simple enum validation', () => {
        const schema = json.enum([1, 2, 3])
        assert(schema.enum, [1, 2, 3])
        return schema
      })
      // equivalent
      test('enum', 'simple enum validation', () => {
        const schema = json.enum(1, 2, 3)
        assert(schema.enum, [1, 2, 3])
        return schema
      })
      test('enum', 'heterogeneous enum validation', () => {
        const schema = json.enum([6, "foo", [], true, { "foo": 12 }])
        assert(schema.enum, [6, "foo", [], true, { "foo": 12 }])
        return schema
      })
      test('enum', 'enums in properties', () => {
        const schema = json
            .type('object')
            .required(['bar'])
            .properties({
              foo: json.enum('foo'),
              bar: json.enum('bar')
            })
        return schema
      })
      // equivalent (adding properties constructed with name and value)
      test('enum', 'enums in properties', () => {
        const schema = json
            .object()
            .property('foo', json.enum('foo'))
            .property('bar', json.enum('bar'), true)
        return schema
      })
      // equivalent (adding properties constructed with objects)
      test('enum', 'enums in properties', () => {
        const schema = json
            .object()
            .property({ foo: json.enum('foo') })
            .property({ bar: json.enum('bar') }, true)
        return schema
      })
    })
    describe('type', () => {
      test('type', 'integer type matches integers', () => {
        const schema = json.integer()
        assert.equal(schema.type(), 'integer')
        return schema
      })
      test('type', 'number type matches numbers', () => {
        const schema = json.number()
        assert.equal(schema.type(), 'number')
        return schema
      })
      test('type', 'string type matches strings', () => {
        const schema = json.string()
        assert.equal(schema.type(), 'string')
        return schema
      })
      test('type', 'object type matches objects', () => {
        const schema = json.object()
        assert(schema.type, 'object')
        return schema
      })
      test('type', 'array type matches arrays', () => {
        const schema = json.array()
        print(schema)
        assert(schema.type, 'array')
        return schema
      })
      test('type', 'boolean type matches booleans', () => {
        const schema = json.boolean()
        assert(schema.type, 'boolean')
        return schema
      })
      test('type', 'null type matches only the null object', () => {
        const schema = json.null()
        assert(schema.type, 'null')
        return schema
      })
      test('type', 'multiple types can be specified in an array', () => {
        const schema = json.type(['integer', 'string'])
        return schema
      })
    })
    describe('allOf tests', () => {
      test('allOf', 'allOf', () => {
        const schema = json.allOf([
          json.property('bar', json.integer(), true),
          json.property('foo', json.string(), true)])
        return schema
      })
      test('allOf', 'allOf', () => {
        const schema = json.allOf(
            json.property('bar', json.integer(), true),
            json.property('foo', json.string(), true))
        return schema
      })
      test('allOf', 'allOf with base schema', () => {
        const schema = json.allOf([
            json.property('foo', json.string(), true),
            json.property('baz', json.null(), true)
          ])
          .property('bar', json.integer(), true)
        return schema
      })
      test('allOf', 'allOf simple types', () => {
        const schema = json.allOf([
          json.maximum(30),
          json.minimum(20)])
        return schema
      })
    })
    describe('anyOf', () => {
      test('anyOf', 'anyOf', () => json.anyOf([json.integer(), json.minimum(2)]))
      // equivalent
      test('anyOf', 'anyOf', () => json.anyOf(json.integer(), json.minimum(2)))
      test('anyOf', 'anyOf with base schema', () => json.string().anyOf([json.maxLength(2), json.minLength(4)]))
    })
    describe('oneOf', () => {
      test('oneOf', 'oneOf', () => json.oneOf([json.integer(), json.minimum(2)]))
      // equivalent
      test('oneOf', 'oneOf', () => json.oneOf(json.integer(), json.minimum(2)))
      test('oneOf', 'oneOf with base schema', () => json.string().oneOf(json.minLength(2), json.maxLength(4)))
    })
    describe('not', () => {
      test('not', 'not', () => json.not(json.integer()))
    })
    describe('type', () => {
      test('not', 'not multiple types', () => json.not(json.type('integer', 'boolean')))
      test('not', 'not more complex schema', () => json.not(json.object().property('foo', json.string())))
      test('not', 'forbidden property', () => json.property('foo', json.not(json.schema())))
    })
  })
  describe('object keywords', () => {
    describe('dependencies', () => {
      test('dependencies', 'dependencies', () => json.dependencies({ 'bar': ['foo'] }))
      test('dependencies', 'multiple dependencies', () => json.dependencies({ 'quux': ['foo', 'bar'] }))
      test('dependencies', 'multiple dependencies subschema', () => {
        const schema = json.dependencies({
          bar: json.properties({
            foo: json.integer(),
            bar: json.integer()
          })
        })
        return schema
      })
    })
    describe('properties', () => {
      test('properties', 'object properties validation', () => {
        const schema = json.properties({
          foo: json.integer(),
          bar: json.string()
        })
        return schema
      })
      // equivalent
      test('properties', 'object properties validation', () => {
        const schema = json
            .property('foo', json.integer())
            .property('bar', json.string())
        return schema
      })
      test('properties', 'properties, patternProperties, additionalProperties interaction', () => {
        const schema = json
            .property('foo', json.array().maxItems(3))
            .property('bar', json.array())
            .patternProperty('f.o', json.minItems(2))
            .additionalProperties(json.integer())
        return schema
      })
    })
    describe('patternProperties', () => {
      test('patternProperties', 'patternProperties validates properties matching a regex', () => {
        const schema = json.patternProperties({ 'f.*o': json.integer() })
        return schema
      })
      // equivalent
      test('patternProperties', 'patternProperties validates properties matching a regex', () => {
        const schema = json.patternProperty('f.*o', json.integer())
        return schema
      })
      // equivalent
      test('patternProperties', 'patternProperties validates properties matching a regex', () => {
        const schema = json.patternProperty({ 'f.*o': json.integer() })
        return schema
      })
      test('patternProperties', 'multiple simultaneous patternProperties are validated', () => {
        const schema = json
            .patternProperty('a*', json.integer())
            .patternProperty('aaa*', json.maximum(20))
        return schema
      })
      test('patternProperties', 'regexes are not anchored by default and are case sensitive', () => {
        const schema = json
            .patternProperty('[0-9]{2,}', json.boolean())
            .patternProperty('X_', json.string())
        return schema
      })
    })
    describe('additionalProperties', () => {
      test('additionalProperties', 'additionalProperties being false does not allow other properties', () => {
        const schema = json
            .properties({
              foo: {},
              bar: {}
            })
            .patternProperties({
              '^v': {}
            })
            .additionalProperties(false)
        return schema
      })
      test('additionalProperties', 'additionalProperties allows a schema which should validate', () => {
        const schema = json
            .properties({
              foo: {},
              bar: {}
            })
            .additionalProperties(json.schema().boolean())
        return schema
      })
      test('additionalProperties', 'additionalProperties can exist by itself', () => {
        const schema = json.additionalProperties(json.boolean())
        return schema
      })
      test('additionalProperties', 'additionalProperties are allowed by default', () => {
        const schema = json
            .properties({
              foo: {},
              bar: {}
            })
        return schema
      })
    })
    test('maxProperties', 'maxProperties validation', () => {
      const schema = json.maxProperties(2)
      return schema
    })
    test('minProperties', 'minProperties validation', () => {
      return json.minProperties(1)
    })
    test('required', 'required validation', () => {
      return json
        .property('foo', {}, true)
        .property('bar', {})
    })
    test('definitions', 'valid definition', () => {
      return json.$ref('http://json-schema.org/draft-04/schema#')
    })
  })
  describe('numeric keywords', () => {
    describe('multipleOf', () => {
      test('multipleOf', 'by int', () => json.multipleOf(2))
      test('multipleOf', 'by number', () => json.multipleOf(1.5))
      test('multipleOf', 'by small number', () => json.multipleOf(0.0001))
    })
    describe('maximum and exclusiveMaximum', () => {
      test('maximum', 'maximum validation', () => json.maximum(3.0))
      test('maximum', 'exclusiveMaximum validation', () => json.maximum(3.0).exclusiveMaximum(true))
    })
    describe('minimum and exclusiveMinimum', () => {
      test('minimum', 'minimum validation', () => json.minimum(1.1))
      test('minimum', 'exclusiveMinimum validation', () => json.minimum(1.1).exclusiveMinimum(true))
    })
  })
  describe('array keywords', () => {
    test('items', 'a schema given for items', () => json.items(json.schema().integer()))
    test('items', 'an array of schemas for items', () => json.items([json.integer(), json.string()]))
    // equivalent
    test('items', 'an array of schemas for items', () => json.items(json.integer(), json.string()))
    test('additionalItems', 'additionalItems as schema', () => {
      const schema = json
          .items([json.schema()])
          .additionalItems(json.integer())
      return schema
    })
    test('additionalItems', 'items is schema, no additionalItems', () => {
      const schema = json
          .items(json.schema())
          .additionalItems(false)
      return schema
    })
    test('additionalItems', 'array of items with no additionalItems', () => {
      const schema = json
          .items(json.schema(), json.schema(), json.schema())
          .additionalItems(false)
      return schema
    })
    test('additionalItems', 'additionalItems as false without items', () => json.additionalItems(false))
    test('additionalItems', 'additionalItems are allowed by default', () => json.items([json.integer()]))
    test('maxItems', 'maxItems validation', () => json.maxItems(2))
    test('minItems', 'minItems validation', () => json.minItems(1))
    test('uniqueItems', 'uniqueItems validation', () => json.uniqueItems(true))
  })
  describe('string keywords', () => {
    test('maxLength', 'maxLength validation', () => json.maxLength(2))
    test('minLength', 'minLength validation', () => json.minLength(2))
    test('pattern', 'pattern validation', () => json.pattern('^a*$'))
    test('pattern', 'pattern is not anchored', () => json.pattern('a+'))
  })
	describe('optional keywords', () => {
		describe('format', () => {
			test('format', 'validation of date-time strings', () => json.format('date-time'))
			test('format', 'validation of URIs', () => json.format('uri'))
			test('format', 'validation of e-mail addresses', () => json.format('email'))
			test('format', 'validation of IP addresses', () => json.format('ipv4'))
			test('format', 'validation of IPv6 addresses', () => json.format('ipv6'))
			test('format', 'validation of host names', () => json.format('hostname'))
		})
		describe('default', () => {
			test('default', 'invalid type for default', () => json.property('foo', json.integer().default([]) ))
			test('default', 'invalid string value for default', () => json.property('bar', json.string().minLength(4).default('bad')))
		})
	})
})

describe('Tests', () => {
  const expectedDir = join(__dirname, 'expected')
  const actualDir = join(__dirname, 'actual')
  function assertMatch(filename) {
    const expected = require(join(expectedDir, filename))
    const actual = require(join(actualDir, filename))
    if (verbose && !isEqual(actual, expected) || verbose) {
      print('\nFilename: %s', filename)
      print('Expected:')
      print(expected)
      print('Actual:')
      print(actual)
    }
    assert(isEqual(actual, expected))
  }
  function rmdir(dir) {
    del.sync(dir, { force: true })
  }
  function test(schema, sample) {
    schema.save(actualDir, sample)
    assertMatch(sample)
  }
  before(() => {
    rmdir(actualDir)
    mkdirSync(actualDir)
  })

  after(() => {
    rmdir(actualDir)
  })

  describe ('save tests', () => {
    it('should write sample schema async', done => {
      const schema = json.string()
      const sample = 'sample1.json'
      schema.save(actualDir, sample, (err) => {
        if (err) return done(err)
        assertMatch(sample)
        done()
      })
    })
    it('should write sample schema sync', () => {
      const schema = json.string()
      const sample = 'sample1.json'
      schema.save(actualDir, sample)
      assertMatch(sample)
    })
  })
  describe ('Simple tests', () => {
    it('should match empty schema', () => {
      const schema = json.schema()
      test(schema, 'empty.json')
    })
    it('should match schema with property', () => {
      const schema = json.property('foo')
      test(schema, 'single-property.json')
    })
    it('should also match schema with property', () => {
      const schema = json.schema().properties({ foo: {} })
      test(schema, 'single-property.json')
    })
    it('should match object schema with property', () => {
      const schema = json.object().property('foo')
      test(schema, 'explicit-object-single-property.json')
    })
    it('should match schema with additional properties allowed', () => {
      const schema = json.object().property('foo').additionalProperties(true)
      test(schema, 'additionalProperties-true.json')
    })
    it('should match schema with additional properties not allowed', () => {
      const schema = json.object().property('foo').additionalProperties(false)
      test(schema, 'additionalProperties-false.json')
    })
    it('should match schema with single required property', () => {
      const schema = json.property('foo', {}, true)
      test(schema, 'single-required-property.json')
    })
    it('should also match schema with single required property', () => {
      const schema = json.property('foo').required(true)
      test(schema, 'single-required-property.json')
    })
    it('should match schema with single required property and no others allowed', () => {
      const schema = json.property('foo').required('foo').additionalProperties(false)
      test(schema, 'single-required-property-additionalProperties-false.json')
    })
    it('should match schema with multiple properties', () => {
      const schema = json
          .property('foo', json.string(), true)
          .property('bar', json.integer())
      test(schema, 'multiple-properties.json')
    })
  })
})
