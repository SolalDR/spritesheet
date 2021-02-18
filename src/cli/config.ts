import {
  CLIChunkConfig,
  CLISpritesheetConfig,
  CLIOutputConfig,
  Config,
} from './interfaces'
import { errorLog } from './helpers/log'

// estlint-disable-next-line
const args = require('yargs').argv

/**
 * Parse spritesheet config
 */
export const getSpritesheetConfig = (params): CLISpritesheetConfig => {
  const mergedParams = { ...params, ...params.s, ...params.spritesheet }

  const width = mergedParams.width || mergedParams.w || null
  const height = mergedParams.height || mergedParams.h || mergedParams.width
  const multiple = !!mergedParams.multiple

  return {
    multiple,
    width: width || 4096,
    height: height || 4096,
    dimensionsForced: !!width,
  }
}

/**
 * Parse chunk config
 */
export const getChunkConfig = (params): CLIChunkConfig => {
  const mergedParams = { ...params.c, ...params.chunk }

  const width = mergedParams.width || mergedParams.w || null
  const height = mergedParams.height || mergedParams.h || null
  const flexibility =
    mergedParams.flexibility || (width === null && height === null ? 1 : 0)

  return {
    width,
    height,
    flexibility,
    dimensionsForced: !!width,
  }
}

/**
 * Parse output config
 */
export const getOutputConfig = (params): CLIOutputConfig => {
  const mergedParams = { ...params }

  if (!mergedParams.name)
    console.log('No name was provided, using "output" by default')
  if (!mergedParams.output)
    console.log(
      'No output path was provided, using current directory by default',
    )

  const name = mergedParams.name || 'output'
  const path = mergedParams.output || '.'

  return {
    name,
    path,
  }
}

/**
 * Parse input config
 */
export const getInputConfig = (params): string[] => {
  if (!params.input) {
    errorLog('No input was provided')
    process.exit()
  }

  return params.input instanceof Array ? params.input : [String(params.input)]
}

export const getConfig = (): Config => {
  return {
    spritesheet: getSpritesheetConfig(args),
    chunk: getChunkConfig(args),
    output: getOutputConfig(args),
    input: getInputConfig(args),
  }
}
