import type { Configuration } from 'webpack';
import type { BuildOptions } from './buildTypes';

export function buildResolves(options: BuildOptions): Configuration['resolve'] {
  return {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': options.paths.src,
    },
  };
}
