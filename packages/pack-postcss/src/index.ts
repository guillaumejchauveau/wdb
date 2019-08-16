import { ComputedValue, Pack, Property } from '@guillaumejchauveau/wdb-core'
import { CSS_PRE_LOADERS } from '@guillaumejchauveau/wdb-pack-css'

const pack: Pack = generator => {
  generator.options.addProperty(new Property('postCSSLoader'))
  CSS_PRE_LOADERS.push(new ComputedValue(c => {
    return {
      loader: 'postcss-loader',
      options: c.options.postCSSLoader
    }
  }))
}

export default pack
