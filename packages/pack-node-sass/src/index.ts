import { ComputedValue, Pack, Property } from '@guillaumejchauveau/wdb-core'
import { CSS_SYNTAX } from '@guillaumejchauveau/wdb-pack-css'

export const SCSS_SYNTAX = 'scss'

const pack: Pack = generator => {
  generator.options.addProperty(new Property('sassLoader'))
  generator.addSyntax(SCSS_SYNTAX)
  generator.addSyntaxLoaderPatcher(
    SCSS_SYNTAX,
    new ComputedValue(c => {
      const cssLoaders = []
      for (const cssLoaderPatcher of c.syntaxLoaderPatchers[CSS_SYNTAX]) {
        const syntaxLoader = cssLoaderPatcher.compute(c)
        if (syntaxLoader) {
          if (syntaxLoader instanceof Array) {
            cssLoaders.push(...syntaxLoader)
          } else {
            cssLoaders.push(syntaxLoader)
          }
        }
      }
      return [
        ...cssLoaders, {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            sassOptions: c.options.sassLoader
          }
        }
      ]
    })
  )
}

export default pack
