export interface ChunkOptions {
  width: number | null
  height: number | null
}

export interface CLIChunkConfig {
  width: number | null
  height: number | null
  flexibility: number
  dimensionsForced: boolean
  [key: string]: any
}

export interface CLISpritesheetConfig {
  width: number
  height: number
  [key: string]: any
}

export interface CLIOutputConfig {
  name: string
  path: string
}

export interface Config {
  chunk: CLIChunkConfig
  spritesheet: CLISpritesheetConfig
  output: CLIOutputConfig
  input: string[]
}
