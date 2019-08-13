#!/usr/bin/env node

import { Configurator, Pack } from '@guillaumejchauveau/wdb-core'
import basePack from './pack-base'
import readPkg from 'read-pkg'
import webpack from 'webpack'

const config = new Configurator()
basePack(config)

let packNames = Object.getOwnPropertyNames(<any>readPkg.sync().devDependencies)
  .filter(packageName => packageName.startsWith('@guillaumejchauveau/wdb-pack'))

for (const packName of packNames) {
  const packPath = require.resolve(
    packName,
    {
      paths: [process.cwd()]
    }
  )
  const pack = <Pack>require(packPath).default
  pack(config)
}

config.options.hydrate({
  syntaxes: {
    css: {
      extensions: ['css']
    },
    scss: {
      extensions: ['scss']
    },
    html: {
      extensions: ['html']
    },
    pug: {
      extensions: ['pug']
    }
  },
  paths: {
    output: {
      path: '{root}/build',
      publicPath: './'
    },
    files: [
      {
        syntaxes: ['css', 'scss'],
        src: '{root}/src/css',
        output: 'css/[name].css',
      },
      {
        syntaxes: ['html', 'pug'],
        src: '{root}/src',
        output: '[name].html'
      }
    ],
    staticCopy: {
      src: '{root}/src/static',
      output: '{root}/build'
    },
    img: {
      extensions: ['png', 'jpg', 'gif', 'svg'],
      src: '{root}/src/img',
      output: 'img/[path][name].[ext]',
      publicPath: './',
      embeddedMaxSize: 5000
    },
    font: {
      extensions: ['woff', 'woff2', 'eot', 'ttf', 'otf'],
      src: '{root}/src/font',
      output: 'font/[path][name].[ext]',
      publicPath: './',
      embeddedMaxSize: 5000
    }
  },
  entry: {
    app: ['index.js', 'common.scss', 'index.pug']
  },
  optimize: {
    minify: true,
    cssnano: {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true
          }
        }
      ]
    },
    htmlminifier: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      conservativeCollapse: false,
      minifyCSS: true,
      minifyJS: true,
      processConditionalComments: true,
      quoteCharacter: '"',
      removeComments: true,
      removeEmptyAttributes: true,
      removeOptionalTags: false,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    },
    imagemin: {
      gifsicle: {
        interlaced: true,
        optimizationLevel: 3
      },
      jpegtran: {
        progressive: true
      },
      optipng: {
        optimizationLevel: 5
      }
    }
  }
})
let wConfig = config.compileConfiguration()

webpack(wConfig, (err, stats) => {
  if (err) {
    throw err
  }
  process.stdout.write(
    stats.toString({
      colors: true,
      hash: false,
      version: false,
      timings: true,
      builtAt: false,
      assets: true,
      entrypoints: false,
      modules: false,
      errors: true,
      moduleTrace: false,
      warnings: true
    }) + '\n'
  )
})
