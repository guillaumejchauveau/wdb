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

const pack: Pack = configurator => {
  // TODO: Check if optimization.removeEmptyChunk does its job.
  /*configurator.addPluginPatcher(
    'EliminateEmptyChunkFile', new ComputedValue(() => new EliminateEmptyChunkFilePlugin())
  )*/
  configurator.addPluginPatcher(
    'CleanWebpack', new ComputedValue(c => {
      return new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*', '!empty']
      })
    })
  )
  configurator.options.addProperty(new Property('optimize.minimize'))
  configurator.addDefaultOptions({
    optimize: {
      minimize: true
    }
  })
  configurator.addDefaultOptions({
    syntaxes: {
      js: {
        extensions: ['js']
      }
    },
  })
  configurator.addDefaultOptions({
    paths: {
      output: {
        path: '{root}/build',
        publicPath: './'
      }
    }
  })
  configurator.addDefaultOptions({
    paths: {
      files: {
        scripts: {
          syntaxes: ['js'],
          src: '{root}/src/js',
          output: 'js/[name].js'
        }
      }
    }
  })
  configurator.addSyntax(JAVASCRIPT_SYNTAX)
  configurator.addMinimizerPatcher(JAVASCRIPT_SYNTAX, new ComputedValue(c => new TerserWebpackPlugin()))
  configurator.addPluginPatcher(
    'WatchIgnore', new ComputedValue(c => {
      return new webpack.WatchIgnorePlugin([
        c.options.paths.output.path,
        '/node_modules/'
      ])
    })
  )
  configurator.addPluginPatcher(
    'FriendlyErrorsWebpack', new ComputedValue(c => {
      if (c.context.mode === MODES.DEV) {
        const friendlyErrors = new FriendlyErrorsWebpackPlugin({
          clearConsole: true
        })
        friendlyErrors.transformers = [
          FriendlyErrorsWebpackPluginConfig.transformers.preFormattedErrorsTransformer
        ]
        friendlyErrors.formatters = [
          FriendlyErrorsWebpackPluginConfig.formatters.preFormattedErrorsFormater
        ]
        return friendlyErrors
      }
      return undefined
    })
  )
}

export default pack
