var path = require('path')

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.json', '.sol']
  },
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, '/dist/'),
    inline: true,
    host: '0.0.0.0',
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        exclude: /(node_modules|bower_components)/,
     },
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'css-loader' // translates CSS into CommonJS
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.sol$/,
        use: [
            {loader: 'web3-loader'},
            {loader: 'solc-loader'}
        ]
      }
    ]
  }
}
