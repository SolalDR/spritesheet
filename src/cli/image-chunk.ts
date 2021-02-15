interface ImageChunkOptions {
  image: Buffer
  width: number
  height: number
}

export class ImageChunk {
  image: Buffer
  width: number
  height: number

  constructor({ image, width, height }) {
    this.image = image
    this.width = width
    this.height = height
  }
}
