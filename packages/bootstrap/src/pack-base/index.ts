import {
  ComputedValue,
  JAVASCRIPT_SYNTAX,
  MODES,
  Pack
} from '@guillaumejchauveau/wdb-core'

import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import FriendlyErrorsWebpackPluginConfig
  from '@guillaumejchauveau/friendly-errors-webpack-plugin-config'
import TerserWebpackPlugin from 'terser-webpack-plugin'
import EliminateEmptyChunkFilePlugin
  from 'eliminate-empty-chunk-file-webpack-plugin'

const pack: Pack = generator => {
  // TODO: Check if optimization.removeEmptyChunk does its job.
  generator.addPluginPatcher(
    'EliminateEmptyChunkFile', new ComputedValue(() => new EliminateEmptyChunkFilePlugin())
  )
  generator.addPluginPatcher(
    'CleanWebpack', new ComputedValue(c => {
      return new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*']
      })
    })
  )
  generator.addSyntax(JAVASCRIPT_SYNTAX)
  generator.addMinimizerPatcher(JAVASCRIPT_SYNTAX, new ComputedValue(c => new TerserWebpackPlugin()))
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
