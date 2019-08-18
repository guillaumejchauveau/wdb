import {
  ComputedValue,
  Pack,
  Property,
  Options,
  PatcherContext,
  MODES
} from '@guillaumejchauveau/wdb-core'
import { RuleSetUseItem } from 'webpack'

import OptimizeCssAssetsWebpackPlugin from 'optimize-css-assets-webpack-plugin'
import ExtractCssChunkWebpackPlugin from 'extract-css-chunks-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

export const CSS_SYNTAX = 'css'
export const CSS_PRE_LOADERS: ComputedValue<RuleSetUseItem, PatcherContext>[] = []

const pack: Pack = generator => {
  generator.options.addProperty(new Property('optimize.cssnano'))
  generator.addSyntax(CSS_SYNTAX)
  generator.addSyntaxLoaderPatcher(
    CSS_SYNTAX,
    new ComputedValue(c => [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          sourceMap: c.context.mode === MODES.DEV
        }
      },
      ...CSS_PRE_LOADERS.map(value => value.compute(c)),
      {
        loader: 'resolve-url-loader',
        options: {
          sourceMap: true
        }
      }
    ])
  )
  generator.addMinimizerPatcher(
    CSS_SYNTAX,
    new ComputedValue(c => {
      return new OptimizeCssAssetsWebpackPlugin({
        cssProcessorOptions: c.options.optimize.cssnano
      })
    })
  )
  generator.addPluginPatcher('ExtractCSSChunks', new ComputedValue(c => {
    return new MiniCssExtractPlugin({
      filename: Options.getSyntaxFileTypeOptions(CSS_SYNTAX, c.options).output
    })
  }))
}

export default pack
