import { ComputedValue, Pack } from '@guillaumejchauveau/wdb-core'
import { CSS_PRE_LOADERS } from '@guillaumejchauveau/wdb-pack-css'

const pack: Pack = configurator => {
  CSS_PRE_LOADERS.push(new ComputedValue(c => 'postcss-loader'))
}

export default pack
