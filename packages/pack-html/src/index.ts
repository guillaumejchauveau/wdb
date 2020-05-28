import {
  ComputedValue,
  MODES,
  Options,
  Pack,
  Property
} from '@guillaumejchauveau/wdb-core'
import { extensionsAsRegex } from '@guillaumejchauveau/wdb-core/lib/utils'

import { Compiler } from 'webpack'

import HTMLAssetsInjectionPlugin from 'html-assets-injection-webpack-plugin'

export const HTML_SYNTAX = 'html'

const pack: Pack = generator => {
  generator.options.addProperty(new Property('optimize.htmlminifier'))
  generator.options.addProperty(new Property('htmlLoader.attrs'))
  generator.addSyntax(HTML_SYNTAX)
  generator.addSyntaxLoaderPatcher(
    HTML_SYNTAX,
    new ComputedValue(c => [
      {
        loader: 'file-loader',
        options: {
          context: c.options.paths.src,
          name: Options.getSyntaxFileTypeOptions(HTML_SYNTAX, c.options).output
        }
      },
      {
        loader: 'extract-loader',
        options: {
          publicPath: c.options.paths.output.publicPath
        }
      },
      {
        loader: 'html-loader',
        options: {
          attrs: c.options.htmlLoader.attrs,
          ...c.options.optimize.htmlminifier,
          minimize: c.context.mode === MODES.PROD
        }
      }
    ])
  )
  generator.addPluginPatcher('HTMLAssetsInjectionPlugin', new ComputedValue(c => {
    return new HTMLAssetsInjectionPlugin()
  }))
  // For whatever reason webpack recompiles HTML files even if they are not changed, causing a reload.
  generator.addPluginPatcher('HTMLReload', new ComputedValue(c => {
    const htmlMatcher = new RegExp(extensionsAsRegex(c.options.syntaxes[HTML_SYNTAX].extensions))
    if (c.context.mode === MODES.DEV) {
      return {
        apply (compiler: Compiler) {
          compiler.hooks.afterEmit.tap('HMRHTMLReload', compilation => {
            for (const assetName of Object.getOwnPropertyNames(compilation.assets)) {
              if (assetName.match(htmlMatcher) &&
                compilation.assets[assetName].emitted) {
                // @ts-ignore
                generator.devServer.sockWrite(generator.devServer.sockets, 'content-changed')
              }
            }
          })
        }
      }
    }
  }))
}

export default pack
