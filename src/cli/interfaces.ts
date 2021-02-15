import { ImageSet } from './image-set'

export interface ChunkOptions {
  width: number | null
  height: number | null
}

export interface CLIChunkConfig {
  width: number | null
  height: number | null
  resize: number | null
  [key: string]: any
}

export interface CLISpritesheetConfig {
  width: number
  height: number
  [key: string]: any
}

export interface CLIOutputConfig {
  name: string
  dir: string
}
