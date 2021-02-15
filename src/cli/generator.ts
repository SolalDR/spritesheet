import { ImageSet, ImageSetOptions } from './image-set'
import { CLIChunkConfig, CLIOutputConfig } from './interfaces'
import { actionLog, errorLog, successLog, warningLog } from './log'

// eslint-disable-next-line
const sharp = require('sharp')
// eslint-disable-next-line
const fs = require('fs').promises

export interface GeneratorOptions {
  width: number
  height: number
  output: CLIOutputConfig
  imageSets: ImageSet[] | ImageSetOptions[]
  chunkConfig: CLIChunkConfig
}

export class Generator {
  imageSets: ImageSet[] = []
  width: number
  height: number
  output: CLIOutputConfig
  chunkConfig: CLIChunkConfig
  constructor({
    width,
    height,
    output,
    imageSets,
    chunkConfig,
  }: GeneratorOptions) {
    this.width = width
    this.height = height
    this.chunkConfig = chunkConfig
    this.imageSets = (imageSets as any[]).map(
      (set): ImageSet =>
        (set instanceof ImageSet ? set : new ImageSet(set)) as ImageSet,
    )
    this.output = output
  }

  get name(): string {
    return this.output.name
  }

  get directory(): string {
    return this.output.dir.slice(-1) !== '/'
      ? this.output.dir + '/'
      : this.output.dir
  }

  processGrid({
    width = this.width,
    height = this.height,
    imageSet = null,
    loss = 0,
  }) {
    if (!imageSet) return null
    const images = imageSet.images
    let anchorPoints = [{ x: 0, y: 0 }]
    const chunks = []

    const computeTotalPixelUse = () => {
      return chunks.reduce((acc, value) => acc + value.width * value.height, 0)
    }

    const computeBoundaries = () => {
      return chunks.reduce(
        (acc, value) => {
          if (value.coords.x + value.width > acc.x)
            acc.x = value.coords.x + value.width
          if (value.coords.y + value.height > acc.y)
            acc.y = value.coords.y + value.height
          return acc
        },
        { x: 0, y: 0 },
      )
    }

    /**
     * Remove anchorPoints no longer available cause to a position conflict with already registered chunks
     */
    const filterAnchorPoints = () => {
      anchorPoints = anchorPoints.filter(point => {
        const conflictedChunk = chunks.find(
          chunk =>
            point.x >= chunk.coords.x &&
            point.x < chunk.coords.x + chunk.width &&
            point.y >= chunk.coords.y &&
            point.y < chunk.coords.y + chunk.height,
        )
        if (conflictedChunk) return false
        return true
      })
    }

    const attributeLocation = image => {
      // Filter the anchor points no longer available
      filterAnchorPoints()

      // Filter for anchor points inside boundaries
      const possibleAnchorPoints = anchorPoints.filter(
        point =>
          point.x + image.width < width && point.y + image.height < height,
      )
      if (possibleAnchorPoints.length === 0)
        throw new Error('Cannot find space for image')

      const anchorPoint = possibleAnchorPoints.reduce(
        (acc: any, value: any) => {
          const farestCurrentValue = Math.max(
            value.x + image.width,
            value.y + image.height,
          )
          const farestAccValue = Math.max(
            acc.x + image.width,
            acc.y + image.height,
          )
          if (farestCurrentValue < farestAccValue) {
            return value
          }
          return acc
        },
        { x: width, y: height },
      )

      if (anchorPoint) {
        // remove attributed anchor point
        const index = anchorPoints.findIndex(point => {
          return point.x === anchorPoint.x && point.y === anchorPoint.y
        })

        anchorPoints.splice(index, 1)
        anchorPoints.push(
          { x: anchorPoint.x + image.width, y: anchorPoint.y },
          { x: anchorPoint.x, y: anchorPoint.y + image.height },
        )

        return anchorPoint
      }
      throw new Error('Cannot find space for image')
    }

    images.forEach((image, i) => {
      const ratio = image.width / image.height
      const width = ~~((imageSet.chunk.width || image.width) * (1 - loss))
      const height = ~~(width / ratio)

      // console.log(image.chunk.width)

      const coords = attributeLocation({ width, height })
      chunks.push({
        image,
        height,
        width,
        ratio,
        coords,
      })
    })

    return {
      chunks,
      totalPixel: computeTotalPixelUse(),
      boundaries: computeBoundaries(),
      loss: 1 - computeTotalPixelUse() / (width * height),
    }
  }

  get resizeFactor() {
    if (this.chunkConfig.width || this.chunkConfig.height) {
      return this.chunkConfig.resize || 0
    }
    return this.chunkConfig.resize || 1
  }

  computeGrid() {
    let grid = null
    try {
      const g = this.processGrid({
        width: this.width,
        height: this.height,
        loss: 0,
        imageSet: this.imageSets[0],
      })
      if (g) grid = g
    } catch (err) {}

    const resize = this.resizeFactor
    for (let i = -resize; i < resize; i += 0.01) {
      try {
        const g = this.processGrid({
          width: this.width,
          height: this.height,
          loss: i,
          imageSet: this.imageSets[0],
        })
        if (g) {
          if (!grid || grid.loss > g.loss) grid = g
        }
      } catch (err) {}
    }

    return grid
  }

  async generateMetadata(grid) {
    const datas = grid.chunks.map(({ width, height, coords }, index) => {
      return {
        width,
        height,
        top: coords.y,
        left: coords.x,
        rank: index,
      }
    })

    const stringData = JSON.stringify(datas)
    await fs.writeFile(`${this.directory}${this.name}.json`, stringData)
  }

  async generateSprite(grid) {
    const composites = await Promise.all(
      grid.chunks.map(async chunk => {
        const buffer = await chunk.image.sharp
          .resize(chunk.width, chunk.height)
          .toBuffer()
        return {
          input: buffer,
          top: chunk.coords.y,
          left: chunk.coords.x,
        }
      }),
    )

    try {
      sharp({
        create: {
          width: this.width,
          height: this.height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite(composites)
        .sharpen()
        .withMetadata()
        .png({ quality: 90 })
        .toFile(`${this.directory}${this.name}.png`, err => {
          if (err) {
            errorLog('File generation', err)
          } else {
            successLog(
              'Files generated successfully',
              '',
              `- ${this.name}.png\n- ${this.name}.json`,
            )
          }
        })
    } catch (err) {
      console.log(err)
    }
  }

  get chunkSize() {
    let size = ''
    size += this.chunkConfig.width ? `${this.chunkConfig.width}x` : `?x`
    size += this.chunkConfig.height ? `${this.chunkConfig.height}` : `?`
    if (size === '?x?') return 'auto'
    return size
  }

  get chunkResize() {
    if (this.chunkSize === 'auto' && !this.chunkConfig.resize) return 'auto'
    return this.chunkConfig.resize
      ? this.chunkConfig.resize * 100 + '%'
      : 'none'
  }

  async run() {
    await Promise.all(this.imageSets.map(set => set.load())).catch(err => {
      errorLog('Loading', '', err)
      process.exit()
    })

    actionLog(
      'Grid will be generated ',
      '',
      `- spritesheet dimension: ${this.width}x${this.height}px\n` +
        `- chunk size: ${this.chunkSize}\n` +
        `- resize: ${
          this.chunkConfig.resize ? this.chunkConfig.resize * 100 + '%' : 'auto'
        }\n` +
        `- output path : ${this.directory}${this.name}.(png|json)\n`,
    )

    const grid = this.computeGrid()
    if (!grid) {
      errorLog('Cannot generate grid', 'Unknown error')
      process.exit()
    }

    actionLog(
      'Grid has been generated ',
      '',
      `- Blank space ${~~(grid.loss * 100)}%\n- Boundaries: [${
        grid.boundaries.x
      }, ${grid.boundaries.y}]\n- Number of items : ${grid.chunks.length}`,
    )
    if (
      grid.boundaries.x < this.width * 0.75 &&
      grid.boundaries.y < this.height * 0.75
    ) {
      warningLog(
        'Generation',
        `There is a lot of blank space in the spritesheet, consider changing resolution of either chunk or spritesheet `,
      )
    }

    if (!grid) {
      errorLog(
        'Generation',
        'Cannot generate grid',
        'try decrease chunk width or increase spritesheet dimension',
      )
      process.exit()
    }

    actionLog(
      'Start generation ',
      '',
      `This operation can take some time to complete`,
    )

    await this.generateMetadata(grid)
    await this.generateSprite(grid)
  }
}

// Feature CLI generate

// - open a list of image
// - crop / resize these image

// - generate a map from a liste of image
//   - before
//     - crop image
//   - parameters
//     - image chunk size
//     - spritesheet size
//   - after
//     - compress

// - generate data for json file

// "spritesheet generate --cw 400 --ch 1024 --w 4096 --c 50 --d ./my-images/"
// "spritesheet generate ./my-images/**.png"
// "spritesheet generate ./my-images/**.png ./my-images/**.png "

// // Feature interpretor

// - return a chunk based on rank
