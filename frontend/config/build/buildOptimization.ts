import webpack from 'webpack';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlMinimizerPlugin from 'html-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

export function buildOptimization(): webpack.Configuration['optimization'] {
  return {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new HtmlMinimizerPlugin(),
      new TerserPlugin(),
    ],
  };
}
