'use strict'

module.exports = {
  collectCoverage: true,
  testEnvironment: 'node',
  coverageReporters: ['text', 'html'],
  testMatch: ['**/test/**/*.[jt]s?(x)']
}
