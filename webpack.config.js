const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new TerserPlugin({
      terserOptions: {
        keep_fnames: ['signIn', 'fetchProtected'],
        mangle: {
          reserved: [
            "signIn",
            "fetchProtected"
          ]
        }
      }
    })
  ],
  mode: "development"
};
