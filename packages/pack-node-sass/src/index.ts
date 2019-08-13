import { ComputedValue, Pack } from '@guillaumejchauveau/wdb-core'
import { CSS_SYNTAX } from '@guillaumejchauveau/wdb-pack-css'

export const SCSS_SYNTAX = 'scss'

const pack: Pack = configurator => {
  configurator.addSyntax(SCSS_SYNTAX)
  configurator.addSyntaxLoaderPatcher(
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

          }
        }
      ]
    })
  )
}

export default pack
