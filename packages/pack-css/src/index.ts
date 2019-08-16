import {
  ComputedValue,
  Pack,
  Property,
  Options,
  PatcherContext
} from '@guillaumejchauveau/wdb-core'
import { RuleSetUseItem } from 'webpack'

import OptimizeCssAssetsWebpackPlugin from 'optimize-css-assets-webpack-plugin'
import ExtractCssChunkWebpackPlugin from 'extract-css-chunks-webpack-plugin'

export const CSS_SYNTAX = 'css'
export const CSS_PRE_LOADERS: ComputedValue<RuleSetUseItem, PatcherContext>[] = []

const pack: Pack = generator => {
  generator.options.addProperty(new Property('optimize.cssnano'))
  generator.addSyntax(CSS_SYNTAX)
  generator.addSyntaxLoaderPatcher(
    CSS_SYNTAX,
    new ComputedValue(c => [
      ExtractCssChunkWebpackPlugin.loader,
      'css-loader',
      ...CSS_PRE_LOADERS.map(value => value.compute(c))
    ])
  )
  generator.addMinimizerPatcher(
    CSS_SYNTAX,
    new ComputedValue(c => {
      return c.options.optimize.minimize ? new OptimizeCssAssetsWebpackPlugin({
        cssProcessorOptions: c.options.optimize.cssnano
      }) : undefined
    })
  )
  generator.addPluginPatcher('ExtractCSSChunks', new ComputedValue(c => {
    return new ExtractCssChunkWebpackPlugin({
      filename: Options.getSyntaxFileTypeOptions(CSS_SYNTAX, c.options).output
    })
  }))
}

export default pack
