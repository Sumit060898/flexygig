const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Entry point of your application
  entry: './src/App.jsx',

  // Output of the bundled file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  // Mode: development or production
  mode: 'production',

  // Source maps for debugging
  devtool: 'inline-source-map',

  // Development server configuration
  devServer: {
    static: './dist',
    hot: true,
  },

  // Loaders and rules
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  // Plugins
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html' // Path to your HTML template
    })
  ]
};