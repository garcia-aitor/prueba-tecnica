import { merge } from 'webpack-merge';
import type { Configuration } from 'webpack';
import common from './webpack.common';

const config: Configuration = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
  },
});

export default config;
