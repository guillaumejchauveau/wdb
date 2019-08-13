import { ComputedValue, Pack } from '@guillaumejchauveau/wdb-core'
import { HTML_SYNTAX } from '@guillaumejchauveau/wdb-pack-html'

export const PUG_SYNTAX = 'pug'

const pack: Pack = configurator => {
  configurator.addSyntax(PUG_SYNTAX)
  configurator.addSyntaxLoaderPatcher(
    PUG_SYNTAX,
    new ComputedValue(c => {
      const htmlLoaders = []
      for (const htmlLoaderPatcher of c.syntaxLoaderPatchers[HTML_SYNTAX]) {
        const syntaxLoader = htmlLoaderPatcher.compute(c)
        if (syntaxLoader) {
          if (syntaxLoader instanceof Array) {
            htmlLoaders.push(...syntaxLoader)
          } else {
            htmlLoaders.push(syntaxLoader)
          }
        }
      }
      return [
        ...htmlLoaders, {
          loader: 'pug-html-loader'
        }
      ]
    })
  )
}

export default pack
