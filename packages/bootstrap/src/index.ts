#!/usr/bin/env node

import {
  ConfigurationGenerator,
  Pack,
  MODES
} from '@guillaumejchauveau/wdb-core'
import basePack from './pack-base'
import readPkg from 'read-pkg'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import rimraf from 'rimraf'

import cosmiconfig from 'cosmiconfig'
import yargs from 'yargs'

const MODULE_NAME = 'wdb'

function createConfigurationGenerator (mode: MODES): ConfigurationGenerator {
  const generator = new ConfigurationGenerator(mode)
  basePack(generator)
  let packNames = Object.getOwnPropertyNames(<any>readPkg.sync().devDependencies)
    .filter(packageName => packageName.match(/^@.*\/wdb-pack-.*$/))

  for (const packName of packNames) {
    const packPath = require.resolve(
      packName,
      {
        paths: [process.cwd()]
      }
    )
    const pack = <Pack>require(packPath).default
    pack(generator)
  }

  const optionsExplorer = cosmiconfig(MODULE_NAME)
  const result = optionsExplorer.searchSync()
  if (!result) {
    throw new Error('No configuration provided for WDB')
  }
  const userOptions = result.config
  const optionsSets: object[] = []
  if (userOptions.hasOwnProperty('presets')) {
    if (!Array.isArray(userOptions.presets)) {
      throw new Error('WDB configuration error: "presets" must be an array')
    }
    for (const presetName of userOptions.presets) {
      const presetPath = require.resolve(
        presetName,
        {
          paths: [process.cwd()]
        }
      )
      optionsSets.push(require(presetPath))
    }
    delete userOptions.presets
  }
  optionsSets.push(userOptions)

  for (const optionSet of optionsSets.reverse()) {
    generator.options.hydrate(optionSet, true)
  }

  return generator
}

const statsOptions = {
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
}

yargs.scriptName(MODULE_NAME)
  .usage('Usage: $0 <command> [options]')
  .command('build', 'Builds the project in production mode', yargs => yargs,
    () => {
      const webpackConfiguration = createConfigurationGenerator(MODES.DEV).compileConfiguration()
      const compiler = webpack(webpackConfiguration)
      compiler.run((err, stats) => {
        if (err) {
          throw err
        }
        process.stdout.write(stats.toString(statsOptions) + '\n')
      })
    }
  )
  .command('dev', 'Builds the project in development mode', yargs => yargs,
    () => {
      const webpackConfigurator = createConfigurationGenerator(MODES.DEV)
      const options = webpackConfigurator.getComputedOptions()
      const webpackConfiguration = webpackConfigurator.compileConfiguration()
      const compiler = webpack(webpackConfiguration)
      const server = new WebpackDevServer(compiler, {
        contentBase: options.paths.output.path,
        hot: true,
        historyApiFallback: true,
        quiet: false,
        noInfo: false,
        //publicPath: options.paths.output.publicPath,
        stats: statsOptions
      })

      server.listen(8080, 'localhost')
    }
  )
  .command('clean', 'Cleans generated files', yargs => yargs,
    () => {
      const webpackConfigurator = createConfigurationGenerator(MODES.PROD)
      const options = webpackConfigurator.getComputedOptions()
      rimraf.sync(options.paths.output.path)
    }
  )
  .alias('h', 'help')
  .alias('v', 'version')
  .help()
  .argv
