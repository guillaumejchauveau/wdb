import {
  ComputedValue,
  Pack,
  Property,
  MODES
} from '@guillaumejchauveau/wdb-core'
import { extensionsAsRegex } from '@guillaumejchauveau/wdb-core/lib/utils'
import path from 'path'
import ImageminPlugin from 'imagemin-webpack-plugin'

const pack: Pack = configurator => {
  configurator.options.addProperty(new Property('paths.img.extensions'))
  configurator.options.addProperty(new Property('paths.img.src', path.isAbsolute))
  configurator.options.addProperty(new Property('paths.img.output'))
  configurator.options.addProperty(new Property('paths.img.publicPath'))
  configurator.options.addProperty(new Property('paths.img.embeddedMaxSize'))
  configurator.addModuleRulePatcher('IMG', new ComputedValue(c => {
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
  configurator.options.addProperty(new Property('optimize.imagemin'))
  configurator.addPluginPatcher('Imagemin', new ComputedValue(c => {
    if (c.context.mode === MODES.PROD) {
      return new ImageminPlugin(c.options.optimize.imagemin)
    }
  }))

  configurator.options.addProperty(new Property('paths.font.extensions'))
  configurator.options.addProperty(new Property('paths.font.src', path.isAbsolute))
  configurator.options.addProperty(new Property('paths.font.output'))
  configurator.options.addProperty(new Property('paths.font.publicPath'))
  configurator.options.addProperty(new Property('paths.font.embeddedMaxSize'))
  configurator.addModuleRulePatcher('FONT', new ComputedValue(c => {
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
