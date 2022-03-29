// eslint-disable-next-line import/no-extraneous-dependencies
const {defaults} = require('jest-config')
module.exports = Object.assign(defaults, {
  testPathIgnorePatterns: ['<rootDir>/src/CounterList.js'],
  transform: {
    '^.+\\.js?$': [
      'esbuild-jest',
      {
        loaders: {
          '.test.js': 'jsx',
          '.js': 'jsx',
        },
      },
    ],
  },
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
})
