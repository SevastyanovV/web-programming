import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';

import type { ModuleOptions } from 'webpack';
import type { BuildOptions } from './buildTypes';

export function buildLoaders(options: BuildOptions): ModuleOptions['rules'] {
  const isDev = options.mode === 'development';
  const isProd = options.mode === 'production';

  const scssLoaderWithModules = {
    loader: 'css-loader',
    options: {
      modules: {
        localIdentName: isDev ? '[path][name]__[local]' : '[hash:base64:8]',
      },
    },
  };

  const scssLoader = {
    test: /\.s[ac]ss$/i,
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      scssLoaderWithModules,
      'sass-loader',
    ],
  };

  const cssLoader = {
    test: /\.css$/,
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      'css-loader'
    ]
  };

  const audioLoader = {
    test: /\.(mp3|wav|ogg)$/,
    use: {
      loader: 'file-loader',
      options: {
        name: 'audio/[name].[hash:8].[ext]',
        outputPath: 'assets/audio/',
        publicPath: 'assets/audio/'
      }
    }
  };

  const videoLoader = {
    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    use: {
      loader: 'file-loader',
      options: {
        name: 'video/[name].[hash:8].[ext]',
        outputPath: 'assets/video/',
        publicPath: 'assets/video/'
      }
    }
  };

  const tsLoader = {
    test: /\.tsx?$/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: isDev,
          getCustomTransformers: () => ({
            before: [isDev && ReactRefreshTypeScript()].filter(Boolean),
          }),
        },
      },
    ],
    exclude: /node_modules/,
  };

  const assetLoader = {
    test: /\.(png|jpg|jpeg|gif)$/i,
    type: 'asset/resource',
  };

  const svgLoader = {
    test: /\.svg$/i,
    issuer: /\.[jt]sx?$/,
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          icon: true,
          svgoConfig: {
            plugins: [
              {
                name: 'convertColors',
                params: {
                  currentColor: true,
                },
              },
            ],
          },
        },
      },
    ],
  };

  return [svgLoader, assetLoader, scssLoader, cssLoader, tsLoader, audioLoader, videoLoader];
}
