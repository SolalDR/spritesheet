// eslint-disable-next-line
const sharp = require('sharp')

export interface ImageSetOptions {
  baseUrl?: string
  paths?: Array<string>
}

export enum ImageSetStatus {
  PENDING = 1,
  LOADING = 2,
  LOADED = 3,
}

export interface ImageData {
  width: number
  height: number
  sharp: unknown
}

/**
 * Define an image collection.
 * If you generate spritesheet for animation purposes, an image set should represent a single animation
 * Therefore, you can use a single spritesheet to store multiple animations defined by multiple image sets
 */
export class ImageSet {
  baseUrl: string
  paths: string[]
  images: ImageData[]
  status: ImageSetStatus = ImageSetStatus.PENDING

  constructor({ baseUrl, paths }: ImageSetOptions) {
    this.baseUrl = baseUrl
    this.paths = paths
    this.images = []
  }

  async load() {
    if (
      this.status === ImageSetStatus.LOADING ||
      this.status === ImageSetStatus.LOADED
    ) {
      console.error(
        'ImageSet: Cannot load twice an image sets. ImageSet is probably already loaded or is loading.',
      )
      return
    }
    this.status = ImageSetStatus.LOADING
    this.images = await Promise.all(
      this.paths.map(async path => {
        const sharpFile = sharp(this.baseUrl + '/' + path)
        const metadata = await sharpFile.metadata()

        return {
          sharp: sharpFile,
          width: metadata.width,
          height: metadata.height,
        }
      }),
    )

    this.status = ImageSetStatus.LOADED
  }
}
