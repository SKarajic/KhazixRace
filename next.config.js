const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  webpack: config => {
    config.resolve.plugins = config.resolve.plugins || []
    config.resolve.plugins.push(new TsconfigPathsPlugin())
    return config
  },
  env: {
    host: process.env.NODE_ENV === 'production'
      ? 'https://race.khazixmains.com'
      : 'http://localhost:3000'
  }
}
