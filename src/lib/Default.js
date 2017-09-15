const Keyword = require( './Keyword')

module.exports = class Default extends Keyword {
	constructor(value) {
		super()
		this.value = value
	}

	get value() {
		return this._value
	}

	set value(value) {
		this._value = value
	}

	json(context = {}) {
		context.default = this.value.json ? this.value.json({}) : this.value
		return context
	}
}