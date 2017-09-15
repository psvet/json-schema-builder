const testSuite = require( 'json-schema-test-suite')
const _ = require( 'lodash')
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
  const group = _.find(draft4, { name: name })
  if (!group) throw new Error("can't find schema for: " + name)
  const section = _.find(group.schemas, { description: description })
  if (!section) throw new Error("can't find section for: " + name + ' => ' + description)
  return section
}

function getSchema(name, description) {
  return getTestSection(name, description).schema
}

function buildTest(name, description, builderFn) {
  test(name + ': ' + description, function () {
    try {
      const expected = getSchema(name, description)
      const actual = builderFn().json()

      if (!_.isEqual(actual, expected) || verbose) {
        print('==============================')
        print('expected =>')
        print(expected)
        print('------------------------------')
        print('actual =>')
        print(actual)
      }

      expect(actual).toEqual(expected)
    } catch (err) {
      print('==============================')
      print('Uncaught error for: %s => %s', name, description)
      throw err
    }
  })
}

buildTest.skip = function () {
  test.skip(arguments[0] + ' => ' + arguments[1], function () {})
}

describe('Tests based on standard JSON Schema Test Suite', () => {
  describe('generic keywords (any instance type)', () => {
    describe('enum', () => {
      buildTest('enum', 'simple enum validation', () => {
        const schema = json.enum([1, 2, 3])
        expect(schema.enum()).toEqual([1, 2, 3])
        return schema
      })
      // equivalent
      buildTest('enum', 'simple enum validation', () => {
        const schema = json.enum(1, 2, 3)
        expect(schema.enum()).toEqual([1, 2, 3])
        return schema
      })
      buildTest('enum', 'heterogeneous enum validation', () => {
        const schema = json.enum([6, "foo", [], true, { "foo": 12 }])
        expect(schema.enum()).toEqual([6, "foo", [], true, { "foo": 12 }])
        return schema
      })
      buildTest('enum', 'enums in properties', () => {
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
      buildTest('enum', 'enums in properties', () => {
        const schema = json
            .object()
            .property('foo', json.enum('foo'))
            .property('bar', json.enum('bar'), true)
        return schema
      })
      // equivalent (adding properties constructed with objects)
      buildTest('enum', 'enums in properties', () => {
        const schema = json
            .object()
            .property({ foo: json.enum('foo') })
            .property({ bar: json.enum('bar') }, true)
        return schema
      })
    })
    describe('type', () => {
      buildTest('type', 'integer type matches integers', () => {
        const schema = json.integer()
        expect(schema.type()).toBe('integer')
        return schema
      })
      buildTest('type', 'number type matches numbers', () => {
        const schema = json.number()
        expect(schema.type()).toBe('number')
        return schema
      })
      buildTest('type', 'string type matches strings', () => {
        const schema = json.string()
        expect(schema.type()).toBe('string')
        return schema
      })
      buildTest('type', 'object type matches objects', () => {
        const schema = json.object()
        expect(schema.type()).toBe('object')
        return schema
      })
      buildTest('type', 'array type matches arrays', () => {
        const schema = json.array()
        print(schema)
        expect(schema.type()).toBe('array')
        return schema
      })
      buildTest('type', 'boolean type matches booleans', () => {
        const schema = json.boolean()
        expect(schema.type()).toBe('boolean')
        return schema
      })
      buildTest('type', 'null type matches only the null object', () => {
        const schema = json.null()
        expect(schema.type()).toBe('null')
        return schema
      })
      buildTest('type', 'multiple types can be specified in an array', () => {
        const schema = json.type(['integer', 'string'])
        return schema
      })
    })
    describe('allOf', () => {
      buildTest('allOf', 'allOf', () => {
        const schema = json.allOf([
          json.property('bar', json.integer(), true),
          json.property('foo', json.string(), true)])
        return schema
      })
      buildTest('allOf', 'allOf', () => {
        const schema = json.allOf(
          json.property('bar', json.integer(), true),
          json.property('foo', json.string(), true))
        return schema
      })
      buildTest('allOf', 'allOf with base schema', () => {
        const schema = json.allOf([
            json.property('foo', json.string(), true),
            json.property('baz', json.null(), true)
          ])
          .property('bar', json.integer(), true)
        return schema
      })
      buildTest('allOf', 'allOf simple types', () => {
        const schema = json.allOf([
          json.maximum(30),
          json.minimum(20)])
        return schema
      })
    })
    describe('anyOf', () => {
      buildTest('anyOf', 'anyOf', () => json.anyOf([json.integer(), json.minimum(2)]))
      // equivalent
      buildTest('anyOf', 'anyOf', () => json.anyOf(json.integer(), json.minimum(2)))
      buildTest('anyOf', 'anyOf with base schema', () => json.string().anyOf([json.maxLength(2), json.minLength(4)]))
    })
    describe('oneOf', () => {
      buildTest('oneOf', 'oneOf', () => json.oneOf([json.integer(), json.minimum(2)]))
      // equivalent
      buildTest('oneOf', 'oneOf', () => json.oneOf(json.integer(), json.minimum(2)))
      buildTest('oneOf', 'oneOf with base schema', () => json.string().oneOf(json.minLength(2), json.maxLength(4)))
    })
    describe('not', () => {
      buildTest('not', 'not', () => json.not(json.integer()))
    })
    describe('type', () => {
      buildTest('not', 'not multiple types', () => json.not(json.type('integer', 'boolean')))
      buildTest('not', 'not more complex schema', () => json.not(json.object().property('foo', json.string())))
      buildTest('not', 'forbidden property', () => json.property('foo', json.not(json.schema())))
    })
  })
  describe('object keywords', () => {
    describe('dependencies', () => {
      buildTest('dependencies', 'dependencies', () => json.dependencies({ 'bar': ['foo'] }))
      buildTest('dependencies', 'multiple dependencies', () => json.dependencies({ 'quux': ['foo', 'bar'] }))
      buildTest('dependencies', 'multiple dependencies subschema', () => {
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
      buildTest('properties', 'object properties validation', () => {
        const schema = json.properties({
          foo: json.integer(),
          bar: json.string()
        })
        return schema
      })
      // equivalent
      buildTest('properties', 'object properties validation', () => {
        const schema = json
            .property('foo', json.integer())
            .property('bar', json.string())
        return schema
      })
      buildTest('properties', 'properties, patternProperties, additionalProperties interaction', () => {
        const schema = json
            .property('foo', json.array().maxItems(3))
            .property('bar', json.array())
            .patternProperty('f.o', json.minItems(2))
            .additionalProperties(json.integer())
        return schema
      })
    })
    describe('patternProperties', () => {
      buildTest('patternProperties', 'patternProperties validates properties matching a regex', () => {
        const schema = json.patternProperties({ 'f.*o': json.integer() })
        return schema
      })
      // equivalent
      buildTest('patternProperties', 'patternProperties validates properties matching a regex', () => {
        const schema = json.patternProperty('f.*o', json.integer())
        return schema
      })
      // equivalent
      buildTest('patternProperties', 'patternProperties validates properties matching a regex', () => {
        const schema = json.patternProperty({ 'f.*o': json.integer() })
        return schema
      })
      buildTest('patternProperties', 'multiple simultaneous patternProperties are validated', () => {
        const schema = json
            .patternProperty('a*', json.integer())
            .patternProperty('aaa*', json.maximum(20))
        return schema
      })
      buildTest('patternProperties', 'regexes are not anchored by default and are case sensitive', () => {
        const schema = json
            .patternProperty('[0-9]{2,}', json.boolean())
            .patternProperty('X_', json.string())
        return schema
      })
    })
    describe('additionalProperties', () => {
      buildTest('additionalProperties', 'additionalProperties being false does not allow other properties', () => {
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
      buildTest('additionalProperties', 'additionalProperties allows a schema which should validate', () => {
        const schema = json
            .properties({
              foo: {},
              bar: {}
            })
            .additionalProperties(json.schema().boolean())
        return schema
      })
      buildTest('additionalProperties', 'additionalProperties can exist by itself', () => {
        const schema = json.additionalProperties(json.boolean())
        return schema
      })
      buildTest('additionalProperties', 'additionalProperties are allowed by default', () => {
        const schema = json
            .properties({
              foo: {},
              bar: {}
            })
        return schema
      })
    })
    buildTest('maxProperties', 'maxProperties validation', () => {
      const schema = json.maxProperties(2)
      return schema
    })
    buildTest('minProperties', 'minProperties validation', () => {
      return json.minProperties(1)
    })
    buildTest('required', 'required validation', () => {
      return json
        .property('foo', {}, true)
        .property('bar', {})
    })
    buildTest('definitions', 'valid definition', () => {
      return json.$ref('http://json-schema.org/draft-04/schema#')
    })
  })
  describe('numeric keywords', () => {
    describe('multipleOf', () => {
      buildTest('multipleOf', 'by int', () => json.multipleOf(2))
      buildTest('multipleOf', 'by number', () => json.multipleOf(1.5))
      buildTest('multipleOf', 'by small number', () => json.multipleOf(0.0001))
    })
    describe('maximum and exclusiveMaximum', () => {
      buildTest('maximum', 'maximum validation', () => json.maximum(3.0))
      buildTest('maximum', 'exclusiveMaximum validation', () => json.maximum(3.0).exclusiveMaximum(true))
    })
    describe('minimum and exclusiveMinimum', () => {
      buildTest('minimum', 'minimum validation', () => json.minimum(1.1))
      buildTest('minimum', 'exclusiveMinimum validation', () => json.minimum(1.1).exclusiveMinimum(true))
    })
  })
  describe('array keywords', () => {
    buildTest('items', 'a schema given for items', () => json.items(json.schema().integer()))
    buildTest('items', 'an array of schemas for items', () => json.items([json.integer(), json.string()]))
    // equivalent
    buildTest('items', 'an array of schemas for items', () => json.items(json.integer(), json.string()))
    buildTest('additionalItems', 'additionalItems as schema', () => {
      const schema = json
          .items([json.schema()])
          .additionalItems(json.integer())
      return schema
    })
    buildTest('additionalItems', 'items is schema, no additionalItems', () => {
      const schema = json
          .items(json.schema())
          .additionalItems(false)
      return schema
    })
    buildTest('additionalItems', 'array of items with no additionalItems', () => {
      const schema = json
          .items(json.schema(), json.schema(), json.schema())
          .additionalItems(false)
      return schema
    })
    buildTest('additionalItems', 'additionalItems as false without items', () => json.additionalItems(false))
    buildTest('additionalItems', 'additionalItems are allowed by default', () => json.items([json.integer()]))
    buildTest('maxItems', 'maxItems validation', () => json.maxItems(2))
    buildTest('minItems', 'minItems validation', () => json.minItems(1))
    buildTest('uniqueItems', 'uniqueItems validation', () => json.uniqueItems(true))
  })
  describe('string keywords', () => {
    buildTest('maxLength', 'maxLength validation', () => json.maxLength(2))
    buildTest('minLength', 'minLength validation', () => json.minLength(2))
    buildTest('pattern', 'pattern validation', () => json.pattern('^a*$'))
    buildTest('pattern', 'pattern is not anchored', () => json.pattern('a+'))
  })
	describe('optional keywords', () => {
		describe('format', () => {
			buildTest('format', 'validation of date-time strings', () => json.format('date-time'))
			buildTest('format', 'validation of URIs', () => json.format('uri'))
			buildTest('format', 'validation of e-mail addresses', () => json.format('email'))
			buildTest('format', 'validation of IP addresses', () => json.format('ipv4'))
			buildTest('format', 'validation of IPv6 addresses', () => json.format('ipv6'))
			buildTest('format', 'validation of host names', () => json.format('hostname'))
		})
		describe('default', () => {
			buildTest('default', 'invalid type for default', () => json.property('foo', json.integer().default([]) ))
			buildTest('default', 'invalid string value for default', () => json.property('bar', json.string().minLength(4).default('bad')))
		})
	})
})

describe('Integration', () => {
  const expectedDir = join(__dirname, 'expected')
  const actualDir = join(__dirname, 'actual')
  function assertMatch(filename) {
    const expected = require(join(expectedDir, filename))
    const actual = require(join(actualDir, filename))
    if (verbose && !_.isEqual(actual, expected) || verbose) {
      print('\nFilename: %s', filename)
      print('Expected:')
      print(expected)
      print('Actual:')
      print(actual)
    }
    expect(actual).toEqual(expected)
  }
  function rmdir(dir) {
    del.sync(dir, { force: true })
  }
  beforeAll(() => {
    rmdir(actualDir)
    mkdirSync(actualDir)
  })

  describe('save tests', () => {
    test('should write sample schema with a promise', () => {
      const schema = json.string()
      const sample = 'sample1.json'
      return schema.save(actualDir, sample)
        .then(() => {
          assertMatch(sample)
        })
    })
    test('should write sample schema with a callback', done => {
      const schema = json.string()
      const sample = 'sample1.json'
      schema.save(actualDir, sample, (err) => {
        if (err) return done(err)
        assertMatch(sample)
        done()
      })
    })
    test('should write sample schema sync', () => {
      const schema = json.string()
      const sample = 'sample1.json'
      schema.saveSync(actualDir, sample)
      assertMatch(sample)
    })
  })
  describe('Simple tests', () => {
    test('should match empty schema', () => {
      const schema = json.schema()
      schema.saveSync(actualDir, 'empty.json')
      assertMatch('empty.json')
    })
    test('should match schema with property', () => {
      const schema = json.property('foo')
      schema.saveSync(actualDir, 'empty.json')
      assertMatch('empty.json')
    })
    test('should also match schema with property', () => {
      const schema = json.schema().properties({ foo: {} })
      schema.saveSync(actualDir, 'single-property.json')
      assertMatch('single-property.json')
    })
    test('should match object schema with property', () => {
      const schema = json.object().property('foo')
      schema.saveSync(actualDir, 'explicit-object-single-property.json')
      assertMatch('explicit-object-single-property.json')
    })
    test('should match schema with additional properties allowed', () => {
      const schema = json.object().property('foo').additionalProperties(true)
      schema.saveSync(actualDir, 'additionalProperties-true.json')
      assertMatch('additionalProperties-true.json')
    })
    test('should match schema with additional properties not allowed', () => {
      const schema = json.object().property('foo').additionalProperties(false)
      schema.saveSync(actualDir, 'additionalProperties-false.json')
      assertMatch('additionalProperties-false.json')
    })
    test('should match schema with single required property', () => {
      const schema = json.property('foo', {}, true)
      schema.saveSync(actualDir, 'single-required-property.json')
      assertMatch('single-required-property.json')
    })
    test('should also match schema with single required property', () => {
      const schema = json.property('foo').required(true)
      schema.saveSync(actualDir, 'single-required-property.json')
      assertMatch('single-required-property.json')
    })
    test('should match schema with single required property and no others allowed', () => {
      const schema = json.property('foo').required('foo').additionalProperties(false)
      schema.saveSync(actualDir, 'single-required-property-additionalProperties-false.json')
      assertMatch('single-required-property-additionalProperties-false.json')
    })
    test('should match schema with multiple properties', () => {
      const schema = json
          .property('foo', json.string(), true)
          .property('bar', json.integer())
      schema.saveSync(actualDir, 'multiple-properties.json')
      assertMatch('multiple-properties.json')
    })
  })
})
