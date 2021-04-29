const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

module.exports = {
    entry: {
        main: path.resolve(__dirname, '../src/app.js'),
        game: path.resolve(__dirname, '../src/jeux/game.js'),
        test: path.resolve(__dirname, '../src/test.js'),
        vehicle: path.resolve(__dirname, '../src/vehicle.js'),
        new: path.resolve(__dirname, '../src/new.js'),
        new_game: path.resolve(__dirname, '../src/jeux/new_game.js')
    },
    output:
    {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins:
    [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') }
            ]
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.html'),
            minify: true,
            chunks: ['new']
        }),
        new HtmlWebpackPlugin({
            filename: 'game.html',
            template: path.resolve(__dirname, '../src/jeux/game.html'),
            minify: true,
            chunks: ['new_game']
        }),
        new MiniCSSExtractPlugin()
    ],
    module:
    {
        rules:
        [
            // HTML
            {
                test: /\.(html)$/,
                use: ['html-loader']
            },

            // JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:
                [
                    'babel-loader'
                ]
            },

            // CSS
            {
                test: /\.css$/,
                use:
                [
                    MiniCSSExtractPlugin.loader,
                    'css-loader'
                ]
            },

            // Images
            {
                test: /\.(jpg|png|gif|svg)$/,
                use:
                [
                    {
                        loader: 'url-loader',
                        options:
                        {
                            outputPath: 'assets/images/'
                        }
                    }
                ]
            },

            // Fonts
            {
                test: /\.(otf|ttf|eot|woff|woff2)$/,
                use:
                [
                    {
                        loader: 'url-loader',
                        options:
                        {
                            outputPath: 'assets/fonts/'
                        }
                    }
                ]
            }, 

            // Sound/Music
            {
                test: /\.(mp3)$/,
                use:
                [
                    {
                        loader: 'url-loader',
                        options:
                        {
                            outputPath: 'assets/sound/'
                        }
                    }
                ]
            }, 

            // Shaders
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader'
                ]
            }
        ]
    }
}
