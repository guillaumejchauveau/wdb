import { ComputedValue, Pack, Property } from '@guillaumejchauveau/wdb-core'
import { HTML_SYNTAX } from '@guillaumejchauveau/wdb-pack-html'

export const PUG_SYNTAX = 'pug'

const pack: Pack = generator => {
  generator.options.addProperty(new Property('pugHTMLLoader'))
  generator.addSyntax(PUG_SYNTAX)
  generator.addSyntaxLoaderPatcher(
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
          loader: 'pug-html-loader',
          options: c.options.pugHTMLLoader
        }
      ]
    })
  )
}

export default pack
