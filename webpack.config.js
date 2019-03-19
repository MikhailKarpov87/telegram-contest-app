const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [new UglifyJsPlugin()]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, "src")],
        loaders: "babel-loader"
      }
    ]
  },
  devServer: {
    contentBase: "./dist",
    port: 3000,
    // host: "localhost"
    host: "192.168.1.116"
  }
};
