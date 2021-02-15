export interface Chunk {
  rank: number;
  x: number;
  y: number;
}

export interface SpriteSet {
  width: number,
  height: number,
  name: 'walk',
  chunks: Chunk[]
}

export interface SpritesheetOptions {
  width: number
  height: number
  sprites: SpriteSet[]
}

export class Spritesheet {
  width: number
  height: number
  sprites: SpriteSet[]

  constructor(options: SpritesheetOptions) {
    this.width = options.width
    this.height = options.height
    this.sprites = options.sprites
  }
}

// const s = {
//   width: 4096,
//   height: 4096,
//   sets: {
    
//   }
// }