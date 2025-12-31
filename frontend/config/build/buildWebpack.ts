import { buildLoaders } from './buildLoaders';
import { buildPlugins } from './buildPlugins';
import { buildResolves } from './buildResolves';
import { buildOptimization } from './buildOptimization';

import type { Configuration } from 'webpack';
import type { BuildOptions } from './buildTypes';

export function buildWebpack(options: BuildOptions): Configuration {
  const { paths, mode } = options;
  const isDev = mode === 'development';

  return {
    mode: mode ?? 'development',
    entry: paths.entry,
    output: {
      path: paths.output,
      publicPath: '/',
      filename: '[name].[contenthash].js',
      clean: true,
    },
    plugins: buildPlugins(options),
    module: {
      rules: buildLoaders(options),
    },
    resolve: buildResolves(options),
    optimization: isDev ? undefined : buildOptimization(),
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
  };
}
