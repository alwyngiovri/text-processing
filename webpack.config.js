module.exports = {
  mode: 'development',
  entry: ['./Main/app.js'],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.js$|jsx/,
      exclude: /node_modules/
    }]
  },
  node: {
    fs: "empty",
  }
};