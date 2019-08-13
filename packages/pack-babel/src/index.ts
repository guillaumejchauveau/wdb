import { ComputedValue, Pack, JAVASCRIPT_SYNTAX } from '@guillaumejchauveau/wdb-core'

const pack: Pack = configurator => {
  configurator.addSyntaxLoaderPatcher(
    JAVASCRIPT_SYNTAX,
    new ComputedValue(() => 'babel-loader')
  )
}

export default pack
