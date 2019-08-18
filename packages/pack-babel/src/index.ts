import {
  ComputedValue,
  Pack,
  JAVASCRIPT_SYNTAX,
  Property
} from '@guillaumejchauveau/wdb-core'

const pack: Pack = generator => {
  generator.options.addProperty(new Property('babelLoader'))
  generator.addSyntaxLoaderPatcher(
    JAVASCRIPT_SYNTAX,
    new ComputedValue(c => {
      return {
        loader: 'babel-loader',
        options: {
          sourceMaps: 'inline',
          ...c.options.babelLoader
        }
      }
    })
  )
}

export default pack
