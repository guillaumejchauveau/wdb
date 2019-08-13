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

const pack: Pack = configurator => {
  configurator.options.addProperty(new Property('optimize.cssnano'))
  configurator.addSyntax(CSS_SYNTAX)
  configurator.addSyntaxLoaderPatcher(
    CSS_SYNTAX,
    new ComputedValue(c => [
      ExtractCssChunkWebpackPlugin.loader,
      'css-loader',
      ...CSS_PRE_LOADERS.map(value => value.compute(c))
    ])
  )
  configurator.addMinimizerPatcher(
    CSS_SYNTAX,
    new ComputedValue(c => {
      return c.options.optimize.minimize ? new OptimizeCssAssetsWebpackPlugin({
        cssProcessorOptions: c.options.optimize.cssnano
      }) : undefined
    })
  )
  configurator.addPluginPatcher('ExtractCSSChunks', new ComputedValue(c => {
    return new ExtractCssChunkWebpackPlugin({
      filename: Options.getSyntaxFileTypeOptions(CSS_SYNTAX, c.options).output
    })
  }))
}

export default pack
