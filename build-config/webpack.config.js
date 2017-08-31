const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ModernizrWebpackPlugin = require('modernizr-webpack-plugin');
//const nodeEnv = process.env.NODE_ENV || 'production';

const DEVELOPMENT = process.env.NODE_ENV === 'development';
const PRODUCTION = process.env.NODE_ENV === 'production';
console.log(process.env.NODE_ENV);
console.log(PRODUCTION);

const PATH = {
  src: path.resolve(__dirname, 'src'),
  app: path.resolve(__dirname, 'src/js/app.js'),
  dist: path.resolve(__dirname, 'dist')
};

//---------------------------------------------------------
// POST CSS
//---------------------------------------------------------

postcss = () => ({
    loader: 'postcss-loader',
    options: {
      plugins: PRODUCTION ? [
        require('autoprefixer')()
      ] : []
    },
  });
  //---------------------------------------------------------
  // END OF POST CSS
  //---------------------------------------------------------

module.exports = {
  devtool: 'source-map',
  context: PATH.src,
  entry: {
    app: PATH.app
  },
  output: {
    path: PATH.dist,
    filename: './js/[name]-[hash].min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: `${PATH.src}/js`,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
          presets: ['es2015']
        }
      }
    },
      {
        test: /\.scss$/,
        include: `${PATH.src}/scss`,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', postcss(), 'sass-loader']
        })
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
    },
    {
      test: /\.(svg|jpe?g|gif|png|bmp)$/,
      use: ['file-loader?name=[hash].[ext]&outputPath=images/'/*,
            'image-webpack-loader'*/]
    },
    {
      test: /\.wav$/,
      use: 'file-loader?name=[hash].[ext]&outputPath=sounds/'
    },
    {
      test: /modernizr/,
      use: 'file-loader?name=[name]-[hash].[ext]&outputPath=js/vendor/'
    }
    ]
  },
  plugins: [
    // new ModernizrWebpackPlugin(
    //   {
    //     filename: 'modernizr-[hash].js',
    //     htmlWebpackPlugin: true,
    //     // minify: {
    //     //   output: {
    //     //     comments: false,
    //     //     beautify: false
    //     //   }
    //     // }
    //   }
    // ),
    new HtmlWebpackPlugin({
      template: `${PATH.src}/html/index.html`,
      minify: {
        collapseWhitespace: true,
        removeComments: true
      },
      hash: false
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   output: {
    //     comments: false
    //   }
    // }),
    new ExtractTextPlugin("app-[hash].css"),

  ]
};