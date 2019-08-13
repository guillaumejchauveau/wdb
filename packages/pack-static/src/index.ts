import { ComputedValue, Pack, PatcherContext, Property } from '@guillaumejchauveau/wdb-core'

import path from 'path'

import CopyWebpackPlugin from 'copy-webpack-plugin'

const pack: Pack = configurator => {
  configurator.options.addProperty(new Property('paths.staticCopy.src', path.isAbsolute))
  configurator.options.addProperty(new Property('paths.staticCopy.output', path.isAbsolute))

  configurator.addPluginPatcher(
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
        ],
        {
          ignore: [
            'empty' // Ignore placeholder files.
          ]
        }
      )
    })
  )
}

export default pack
