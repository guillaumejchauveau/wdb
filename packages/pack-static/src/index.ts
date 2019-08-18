import {
  ComputedValue,
  Pack,
  PatcherContext,
  Property
} from '@guillaumejchauveau/wdb-core'

import path from 'path'

import CopyWebpackPlugin from 'copy-webpack-plugin'

const pack: Pack = generator => {
  generator.options.addProperty(new Property('paths.staticCopy.src', path.isAbsolute))
  generator.options.addProperty(new Property('paths.staticCopy.output', path.isAbsolute))

  generator.addPluginPatcher(
    'StaticCopy',
    new ComputedValue((c: PatcherContext) => {
      return new CopyWebpackPlugin(
        [
          {
            from: {
              glob: `${c.options.paths.staticCopy.src}/**/*`,
              dot: true
            },
            to: c.options.paths.staticCopy.output,
            context: c.options.paths.staticCopy.src
          }
        ]
      )
    })
  )
}

export default pack
