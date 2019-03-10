const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  plugins: [new Dotenv()],
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
    host: "localhost"
  }
};
