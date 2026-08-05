import { merge } from 'webpack-merge';
import type { Configuration } from 'webpack';
import 'webpack-dev-server';
import common from './webpack.common';

const config: Configuration = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    filename: '[name].js',
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: true,
  },
});

export default config;
