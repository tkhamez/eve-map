const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const Fiber = require('fibers');

module.exports = {
    entry: {
        app: './src/app.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: "[name].[chunkhash].css",
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['*.css', '*.js'],
        }),
        new CopyWebpackPlugin([
            {from: 'node_modules/three/examples/fonts/*.json', to: 'fonts', flatten: true }
        ]),
        new WriteFileWebpackPlugin({
            test: /.json/
        })
    ],
    output: {
        filename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                {
                    loader: "sass-loader",
                    options: {
                        implementation: require("sass"),
                        fiber: Fiber,
                    }
                }
            ]
        }, {
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }]
    }
};
