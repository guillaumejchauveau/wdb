import {
  ComputedValue,
  JAVASCRIPT_SYNTAX,
  MODES,
  Pack,
  Property
} from '@guillaumejchauveau/wdb-core'

import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import FriendlyErrorsWebpackPluginConfig
  from '@guillaumejchauveau/friendly-errors-webpack-plugin-config'
import TerserWebpackPlugin from 'terser-webpack-plugin'

const pack: Pack = generator => {
  // TODO: Check if optimization.removeEmptyChunk does its job.
  /*generator.addPluginPatcher(
    'EliminateEmptyChunkFile', new ComputedValue(() => new EliminateEmptyChunkFilePlugin())
  )*/
  generator.addPluginPatcher(
    'CleanWebpack', new ComputedValue(c => {
      return new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*']
      })
    })
  )
  generator.options.addProperty(new Property('optimize.minimize'))
  generator.addSyntax(JAVASCRIPT_SYNTAX)
  generator.addMinimizerPatcher(JAVASCRIPT_SYNTAX, new ComputedValue(c => new TerserWebpackPlugin()))
  generator.addPluginPatcher(
    'WatchIgnore', new ComputedValue(c => {
      return new webpack.WatchIgnorePlugin([
        c.options.paths.output.path,
        '/node_modules/'
      ])
    })
  )
  generator.addPluginPatcher(
    'FriendlyErrorsWebpack', new ComputedValue(c => {
      if (c.context.mode === MODES.DEV) {
        const friendlyErrors = new FriendlyErrorsWebpackPlugin({
          clearConsole: true
        })
        // @ts-ignore
        friendlyErrors.transformers = [
          FriendlyErrorsWebpackPluginConfig.transformers.preFormattedErrorsTransformer
        ]
        // @ts-ignore
        friendlyErrors.formatters = [
          FriendlyErrorsWebpackPluginConfig.formatters.preFormattedErrorsFormatter
        ]
        return friendlyErrors
      }
      return undefined
    })
  )
}

export default pack
