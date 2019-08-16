import {
  Configuration,
  Entry,
  Module,
  Plugin,
  RuleSetRule,
  RuleSetUseItem
} from 'webpack'
import ComputedValue from 'comfygurator/lib/ComputedValue'
import Schema from 'comfygurator/lib/Schema'
import Property from 'comfygurator/lib/Property'
import path from 'path'
import { extensionsAsRegex } from './utils'
import { StringTemplateContext } from 'comfygurator/lib/StringTemplateValue'
import { Tapable } from 'tapable'

export type Pack = (generator: ConfigurationGenerator) => void

export { ComputedValue, Property }

export enum MODES {
  DEV = 'development',
  PROD = 'production'
}

export interface ConfigurationGeneratorContext extends StringTemplateContext {
  root: string,
  mode: MODES
}

export interface PatcherContext {
  options: any,
  context: ConfigurationGeneratorContext,
  syntaxLoaderPatchers: {
    [syntaxName: string]: SyntaxLoaderPatcher[]
  }
}

export type ModuleRulePatcher = ComputedValue<RuleSetRule | undefined, PatcherContext>
export type PluginPatcher = ComputedValue<Plugin | undefined, PatcherContext>
export type MinimizerPatcher = ComputedValue<Plugin | Tapable.Plugin | undefined, PatcherContext>
export type SyntaxLoaderPatcher = ComputedValue<RuleSetUseItem[] | RuleSetUseItem | undefined, PatcherContext>

export interface FileTypeOptions {
  syntaxes: string[]
  src: string,
  output: string
}

export interface SyntaxOptions {
  extensions: string[]
}

export namespace Options {
  export function getSyntaxFileTypeOptions (syntaxName: string, options: CoreOptions): FileTypeOptions {
    for (const fileTypeOptions of Object.values(options.paths.files)) {
      if (fileTypeOptions.syntaxes.includes(syntaxName)) {
        return fileTypeOptions
      }
    }
    throw new Error(`No file type options found for syntax '${syntaxName}'`)
  }
}

interface CoreOptions {
  syntaxes: {
    [syntaxName: string]: SyntaxOptions
  },
  paths: {
    output: {
      path: string,
      publicPath: string
    },
    files: {
      [fileTypeName: string]: FileTypeOptions
      [fileTypeName: number]: FileTypeOptions
    }
  },
  webpack: {
    target?: string
  },
  entry: {
    [chunkName: string]: string[]
  }
}

export const JAVASCRIPT_SYNTAX = 'js'

export class ConfigurationGenerator {
  private readonly moduleRulePatchers: {
    [name: string]: ModuleRulePatcher
  }
  private readonly pluginPatchers: {
    [name: string]: PluginPatcher
  }
  private readonly minimizerPatchers: {
    [name: string]: MinimizerPatcher
  }
  private readonly syntaxLoaderPatchers: {
    [syntaxName: string]: SyntaxLoaderPatcher[]
  }
  readonly options: Schema
  readonly mode: MODES

  constructor (mode: MODES) {
    this.mode = mode
    this.moduleRulePatchers = {}
    this.pluginPatchers = {}
    this.minimizerPatchers = {}
    this.syntaxLoaderPatchers = {}
    this.options = Schema.fromArray([
      {
        key: 'paths.output.path',
        typeChecker: path.isAbsolute
      },
      {
        key: 'paths.output.publicPath',
        typeChecker: request => !path.isAbsolute(request)
      },
      {
        key: 'paths.files.*.syntaxes',
        typeChecker: request => request instanceof Array,
        required: false
      },
      {
        key: 'paths.files.*.src',
        typeChecker: path.isAbsolute,
        required: false
      },
      {
        key: 'paths.files.*.output',
        typeChecker: request => !path.isAbsolute(request),
        required: false
      },
      {
        key: 'webpack.target',
        required: false
      },
      {
        key: 'entry',
        typeChecker: request => {
          for (const chunk of Object.values(request)) {
            if (!(<any>chunk instanceof Array)) {
              return false
            }
          }
          return true
        }
      }
    ])
  }

  addSyntax (syntaxName: string) {
    this.options.addProperty(new Property(
      ['syntaxes', syntaxName, 'extensions'],
      request => request instanceof Array
    ))
    this.syntaxLoaderPatchers[syntaxName] = []
    this.addModuleRulePatcher(syntaxName, new ComputedValue((context: PatcherContext) => {
      const syntaxExtensions = context.options.syntaxes[syntaxName].extensions
      const syntaxLoaders = []
      for (const syntaxLoaderPatcher of context.syntaxLoaderPatchers[syntaxName]) {
        const syntaxLoader = syntaxLoaderPatcher.compute(context)
        if (syntaxLoader) {
          if (syntaxLoader instanceof Array) {
            syntaxLoaders.push(...syntaxLoader)
          } else {
            syntaxLoaders.push(syntaxLoader)
          }
        }
      }
      return {
        test: new RegExp(extensionsAsRegex(syntaxExtensions)),
        use: syntaxLoaders,
        exclude: [/node_modules/]
      }
    }))
  }

  hasModuleRulePatcher (patcherName: string): boolean {
    return this.moduleRulePatchers.hasOwnProperty(patcherName)
  }

  addModuleRulePatcher (patcherName: string, patcher: ModuleRulePatcher) {
    if (this.hasModuleRulePatcher(patcherName)) {
      throw new Error()
    }
    this.moduleRulePatchers[patcherName] = patcher
  }

  hasPluginPatcher (patcherName: string): boolean {
    return this.pluginPatchers.hasOwnProperty(patcherName)
  }

  addPluginPatcher (patcherName: string, patcher: PluginPatcher) {
    if (this.hasPluginPatcher(patcherName)) {
      throw new Error()
    }
    this.pluginPatchers[patcherName] = patcher
  }

  hasMinimizerPatcher (patcherName: string): boolean {
    return this.minimizerPatchers.hasOwnProperty(patcherName)
  }

  addMinimizerPatcher (patcherName: string, patcher: MinimizerPatcher) {
    if (this.hasMinimizerPatcher(patcherName)) {
      throw new Error()
    }
    this.minimizerPatchers[patcherName] = patcher
  }

  addSyntaxLoaderPatcher (syntaxName: string, patcher: SyntaxLoaderPatcher) {
    this.syntaxLoaderPatchers[syntaxName].push(patcher)
  }

  getContext (): ConfigurationGeneratorContext {
    return {
      root: process.cwd(),
      mode: this.mode
    }
  }

  getComputedOptions (): CoreOptions {
    const context = this.getContext()

    const options = <CoreOptions>this.options.compute(context)
    for (const fileType of Object.getOwnPropertyNames(options.paths.files)) {
      if (options.paths.files[fileType].syntaxes === undefined) {
        options.paths.files[fileType].syntaxes = []
      }
    }
    return options
  }

  compileConfiguration (): Configuration {
    const context = this.getContext()
    const options = this.getComputedOptions()

    const config: Configuration = {
      context: context.root,
      target: <any>options.webpack.target, // TODO: ?
      mode: context.mode,
      entry: undefined,
      output: {
        path: options.paths.output.path,
        filename: Options.getSyntaxFileTypeOptions(JAVASCRIPT_SYNTAX, options).output,
        publicPath: options.paths.output.publicPath
      },
      module: {
        rules: []
      },
      plugins: [],
      optimization: {
        minimizer: [],
        noEmitOnErrors: context.mode === MODES.PROD
      }
    }

    const entry: Entry = {}
    for (const chunkName of Object.getOwnPropertyNames(options.entry)) {
      entry[chunkName] = []
      const modulePaths = options.entry[chunkName]

      for (const modulePath of modulePaths) {
        let absoluteModulePath = modulePath
        // Automatic path completion.
        if (!path.isAbsolute(modulePath)) {
          const moduleExtension = path.extname(modulePath).substr(1)
          // Looks for a corresponding syntax.
          for (const syntaxName of Object.getOwnPropertyNames(options.syntaxes)) {
            if (options.syntaxes[syntaxName].extensions.includes(moduleExtension)) {
              absoluteModulePath = path.join(
                Options.getSyntaxFileTypeOptions(syntaxName, options).src,
                modulePath
              )
              break
            }
          }
          if (!path.isAbsolute(absoluteModulePath)) {
            throw new Error(`Module extension '${moduleExtension}' does not have a corresponding syntax`)
          }
          (<string[]>entry[chunkName]).push(absoluteModulePath)
        }
      }
    }

    config.entry = entry

    const patchersContext: PatcherContext = {
      options,
      context,
      syntaxLoaderPatchers: this.syntaxLoaderPatchers
    }
    for (const patcher of Object.values(this.moduleRulePatchers)) {
      const patch = patcher.compute(patchersContext)

      if (patch !== undefined) {
        (<Module>config.module).rules.push(patch)
      }
    }
    for (const patcher of Object.values(this.pluginPatchers)) {
      const patch = patcher.compute(patchersContext)

      if (patch !== undefined) {
        (<Plugin[]>config.plugins).push(patch)
      }
    }
    for (const patcher of Object.values(this.minimizerPatchers)) {
      const patch = patcher.compute(patchersContext)

      if (patch !== undefined) {
        (<any>config.optimization).minimizer.push(patch)
      }
    }
    return config
  }
}
