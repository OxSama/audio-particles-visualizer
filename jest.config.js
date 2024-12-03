module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/tests/setup.js'],
    transform: {
      '^.+\\.js$': ['babel-jest', { configFile: './babel.config.cjs' }]
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    testMatch: [
      '<rootDir>/tests/**/*.test.js'
    ]
  };