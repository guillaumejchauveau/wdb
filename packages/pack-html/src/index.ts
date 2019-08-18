import {
  Pack,
  ComputedValue,
  Property,
  Options,
  MODES
} from '@guillaumejchauveau/wdb-core'

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
}

export default pack
