module.exports = class Builder {
  json(context) {
    throw new Error('json must be overridden')
  }
}
