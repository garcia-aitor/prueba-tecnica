import { merge } from 'webpack-merge';
import type { Configuration } from 'webpack';
import 'webpack-dev-server';
import common from './webpack.common';
import { fetchThroughProxy } from './scripts/corsProxy';

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
    setupMiddlewares: (middlewares, devServer) => {
      const app = devServer.app;

      if (!app) {
        throw new Error('webpack-dev-server app is not available');
      }

      app.get('/proxy', async (req, res) => {
        const targetUrl = typeof req.query.url === 'string' ? req.query.url : '';

        if (!targetUrl) {
          res.status(400).type('text').send('Falta el parámetro url');
          return;
        }

        try {
          const result = await fetchThroughProxy(targetUrl);
          res.status(result.status);
          res.setHeader('Content-Type', result.contentType);
          res.send(result.body);
        } catch (error) {
          console.error('Proxy', error);
          res.status(502).type('text').send('No se pudo obtener el recurso');
        }
      });

      return middlewares;
    },
  },
});

export default config;
