const path = require("path");
const webpack = require("webpack");

const ROOT = path.resolve(__dirname, "src");
const DESTINATION = path.resolve(__dirname, "dist");

module.exports = (env, options) => {
    const isProduction = options.mode === 'production';
    return {
        target: "web",
        context: ROOT,
        entry: {
            main: "./game.ts"
        },
        output: {
            filename: "[name].bundle.js",
            path: DESTINATION
        },
        resolve: {
            extensions: [".ts", ".js"],
            modules: [ROOT, "node_modules"]
        },
        module: {
            rules: [
                {
                    enforce: "pre",
                    test: /\.js$/,
                    use: "source-map-loader"
                },
                {
                    enforce: "pre",
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    loader: 'tslint-loader',
                    options: {},
                },
                {
                    test: /\.ts$/,
                    exclude: [/node_modules/],
                    loader: "awesome-typescript-loader"
                }
            ]
        },

        devtool: (isProduction ? "source-map" : "cheap-module-eval-source-map"),
        devServer: {
            host: '0.0.0.0',
            port: 9000,
            inline: true,
            contentBase: './',
            watchContentBase: true,
            publicPath: '/dist/',
            compress:true,
            overlay: {
                warnings: true,
                errors: true
            },
        }
    };
}