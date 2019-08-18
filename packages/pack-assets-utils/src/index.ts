import {
  ComputedValue,
  Pack,
  Property,
  MODES
} from '@guillaumejchauveau/wdb-core'
import { extensionsAsRegex } from '@guillaumejchauveau/wdb-core/lib/utils'
import ImageminPlugin from 'imagemin-webpack-plugin'

const pack: Pack = generator => {
  generator.options.addProperty(new Property('paths.assets.extensions'))
  generator.options.addProperty(new Property('paths.assets.output'))
  generator.options.addProperty(new Property('paths.assets.publicPath'))
  generator.options.addProperty(new Property('paths.assets.embeddedMaxSize'))
  generator.addModuleRulePatcher('IMG', new ComputedValue(c => {
    return {
      test: new RegExp(extensionsAsRegex(c.options.paths.assets.extensions)),
      loader: 'url-loader',
      options: {
        limit: c.options.paths.assets.embeddedMaxSize,
        name: c.options.paths.assets.output,
        context: c.options.paths.src,
        publicPath: c.options.paths.assets.publicPath
      }
    }
  }))
  generator.options.addProperty(new Property('optimize.imagemin'))
  generator.addPluginPatcher('Imagemin', new ComputedValue(c => {
    if (c.context.mode === MODES.PROD) {
      return new ImageminPlugin(c.options.optimize.imagemin)
    }
  }))
}

export default pack
