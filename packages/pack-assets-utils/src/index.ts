import {
  ComputedValue,
  Pack,
  Property,
  MODES
} from '@guillaumejchauveau/wdb-core'
import { extensionsAsRegex } from '@guillaumejchauveau/wdb-core/lib/utils'
import path from 'path'
import ImageminPlugin from 'imagemin-webpack-plugin'

const pack: Pack = generator => {
  generator.options.addProperty(new Property('paths.img.extensions'))
  generator.options.addProperty(new Property('paths.img.src', path.isAbsolute))
  generator.options.addProperty(new Property('paths.img.output'))
  generator.options.addProperty(new Property('paths.img.publicPath'))
  generator.options.addProperty(new Property('paths.img.embeddedMaxSize'))
  generator.addModuleRulePatcher('IMG', new ComputedValue(c => {
    return {
      test: new RegExp(extensionsAsRegex(c.options.paths.img.extensions)),
      loader: 'url-loader',
      options: {
        limit: c.options.paths.img.embeddedMaxSize,
        name: c.options.paths.img.output,
        context: c.options.paths.img.src,
        publicPath: c.options.paths.img.publicPath
      }
    }
  }))
  generator.options.addProperty(new Property('optimize.imagemin'))
  generator.addPluginPatcher('Imagemin', new ComputedValue(c => {
    if (c.context.mode === MODES.PROD) {
      return new ImageminPlugin(c.options.optimize.imagemin)
    }
  }))

  generator.options.addProperty(new Property('paths.font.extensions'))
  generator.options.addProperty(new Property('paths.font.src', path.isAbsolute))
  generator.options.addProperty(new Property('paths.font.output'))
  generator.options.addProperty(new Property('paths.font.publicPath'))
  generator.options.addProperty(new Property('paths.font.embeddedMaxSize'))
  generator.addModuleRulePatcher('FONT', new ComputedValue(c => {
    return {
      test: new RegExp(extensionsAsRegex(c.options.paths.font.extensions)),
      loader: 'url-loader',
      options: {
        limit: c.options.paths.font.embeddedMaxSize,
        name: c.options.paths.font.output,
        context: c.options.paths.font.src,
        publicPath: c.options.paths.font.publicPath
      }
    }
  }))
}

export default pack
