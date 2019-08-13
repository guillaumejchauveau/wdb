import {
  Pack,
  ComputedValue,
  Property,
  Options,
  MODES
} from '@guillaumejchauveau/wdb-core'

import HTMLAssetsInjectionPlugin from 'html-assets-injection-webpack-plugin'

export const HTML_SYNTAX = 'html'

const pack: Pack = configurator => {
  configurator.options.addProperty(new Property('optimize.htmlminifier'))
  configurator.addSyntax(HTML_SYNTAX)
  configurator.addSyntaxLoaderPatcher(
    HTML_SYNTAX,
    new ComputedValue(c => [
      {
        loader: 'file-loader',
        options: {
          context: Options.getSyntaxFileTypeOptions(HTML_SYNTAX, c.options).src,
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
          attrs: ['img:src'],
          ...c.options.optimize.htmlminifier,
          minimize: c.context.mode === MODES.PROD && c.options.minimize
        }
      }
    ])
  )
  configurator.addPluginPatcher('HTMLAssetsInjectionPlugin', new ComputedValue(c => {
    return new HTMLAssetsInjectionPlugin()
  }))
}

export default pack
