import path from 'path';
import { Configuration, ProgressPlugin, DefinePlugin, WebpackPluginInstance } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Dotenv from 'dotenv-webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import type { BuildOptions } from './buildTypes';

export function buildPlugins(options: BuildOptions): Configuration['plugins'] {
  const isProd = options.mode === 'production';
  const isDev = options.mode === 'development';

  const dotenvFilename = isDev ? '.env' : '.env';

  const plugins: Configuration['plugins'] = [
    new HtmlWebpackPlugin({
      template: options.paths.html,
      favicon: path.resolve(options.paths.public, 'favicon.ico'),
    }),
    new DefinePlugin({
      __ENV__: JSON.stringify(options.mode),
    }),
  ];

  if (isDev) {
    plugins.push(new ProgressPlugin());
    plugins.push(new ForkTsCheckerWebpackPlugin());
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  if (isProd) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].css',
      }),
    );
  }

  if (options.isAnalyzer) {
    plugins.push(new BundleAnalyzerPlugin() as unknown as WebpackPluginInstance);
  }

  plugins.push(new Dotenv({
    path: dotenvFilename
  }) as unknown as WebpackPluginInstance);

  return plugins;
}
