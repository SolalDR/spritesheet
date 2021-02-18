import fsBase from 'fs'
import { ImageSet, ImageSetOptions } from './image-set'
import { Config } from './interfaces'
import { actionLog, errorLog, successLog, warningLog } from './helpers/log'
import { doBoxesIntersect } from './helpers/box-intersect'
import { tickProgress, updateMessage } from './helpers/progress'

// eslint-disable-next-line
const sharp = require('sharp')
const fs = fsBase.promises

export interface GeneratorOptions {
  options: Config
  imageSets: ImageSet[] | ImageSetOptions[]
}

export class Generator {
  imageSets: ImageSet[] = []
  options: Config

  constructor({ options, imageSets }: GeneratorOptions) {
    this.options = options
    this.imageSets = (imageSets as any[]).map(
      (set): ImageSet =>
        (set instanceof ImageSet ? set : new ImageSet(set)) as ImageSet,
    )
  }

  get name(): string {
    return this.options.output.name
  }

  get directory(): string {
    return this.options.output.path.slice(-1) !== '/'
      ? this.options.output.path + '/'
      : this.options.output.path
  }

  /**
   * Process a grid based on certain parameter, this methods is perform many times to find the most optimized grid
   */
  processGrid({
    grid = null,
    width = this.options.spritesheet.width,
    height = this.options.spritesheet.height,
    imageSet = null,
    loss = 0,
  }) {
    if (!imageSet || !grid) return null

    const images = imageSet.images
    const chunks = [...grid.chunks]
    const setsChunks = []
    let anchorPoints = [...grid.anchorPoints]

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
      let possibleAnchorPoints = anchorPoints.filter(
        point =>
          point.x + image.width < width && point.y + image.height < height,
      )

      // Filter for anchor points with box intersections issues
      possibleAnchorPoints = possibleAnchorPoints.filter(point => {
        return !chunks.find(c => {
          const box1 = { x: c.coords.x, y: c.coords.y, w: c.width, h: c.height }
          const box2 = {
            x: point.x,
            y: point.y,
            w: image.width,
            h: image.height,
          }
          return doBoxesIntersect(box1, box2)
        })
      })

      if (possibleAnchorPoints.length === 0)
        throw new Error('Cannot find space for image')

      // Get closest anchorPoint of top left corner
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

        // add new anchors points on top right and bottom left corner
        anchorPoints.push(
          { x: anchorPoint.x + image.width, y: anchorPoint.y },
          { x: anchorPoint.x, y: anchorPoint.y + image.height },
        )

        return anchorPoint
      }
      throw new Error('Cannot find space for image')
    }

    // Compute dimensions for each chunk
    const chunksDefinitions = images.map((image, i) => {
      const ratio = image.width / image.height
      const width = ~~((this.options.chunk.width || image.width) * (1 - loss))
      const height = ~~(width / ratio)

      return { image, height, width, ratio, rank: i }
    })

    // Sort chunks
    chunksDefinitions.sort((a, b) => {
      return b.width * b.height - a.width * a.height
    })

    // Attrib location
    chunksDefinitions.forEach(chunkDefinition => {
      const coords = attributeLocation(chunkDefinition)
      const chunk = {
        ...chunkDefinition,
        coords,
      }
      chunks.push(chunk)
      setsChunks.push(chunk)
    })

    return {
      chunks,
      anchorPoints,
      width,
      height,
      totalPixel: computeTotalPixelUse(),
      boundaries: computeBoundaries(),
      loss: 1 - computeTotalPixelUse() / (width * height),
      sets: [
        ...grid.sets,
        {
          chunks: setsChunks,
        },
      ],
    }
  }

  /**
   * Compute a grid for a given image set
   */
  computeGrid(set, grid, index, displayError = true) {
    const { width, height } = this.options.spritesheet
    let newGrid = null

    try {
      const g = this.processGrid({
        grid,
        width,
        height,
        loss: 0,
        imageSet: set,
      })
      if (g) newGrid = g
    } catch (err) {
      if (displayError) {
        errorLog('Compute grid', err)
      }
    }

    const flexibility = this.options.chunk.flexibility
    const total = flexibility * this.imageSets.length
    const base = index * flexibility

    for (let i = 0; i < flexibility; i += 0.01) {
      try {
        updateMessage(~~(((i + base) / total) * 100) + '%')
        tickProgress()
        const g = this.processGrid({
          grid,
          width,
          height,
          loss: i,
          imageSet: set,
        })

        if (g) {
          if (!newGrid || newGrid.loss > g.loss) newGrid = g
        }
      } catch (err) {
        if (displayError) {
          errorLog('Compute grid', err)
        }
      }
    }

    return newGrid
  }

  async generateMetadata(grid) {
    const datas = {
      width: grid.width,
      height: grid.height,
      count: grid.chunks.length,
      boundaries: grid.boundaries,
      sets: grid.sets.map(set => {
        return set.chunks
          .map(({ width, height, coords, rank }) => {
            return {
              width,
              height,
              rank,
              top: coords.y,
              left: coords.x,
            }
          })
          .sort((a, b) => a.rank - b.rank)
      }),
    }

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

    return new Promise((resolve, reject) => {
      try {
        sharp({
          create: {
            width: grid.width,
            height: grid.height,
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
              reject()
            } else {
              successLog(
                'Files generated successfully',
                '',
                `- ${this.name}.png\n- ${this.name}.json`,
              )
              resolve(this.name)
            }
          })
      } catch (err) {
        console.log(err)
      }
    })
  }

  get chunkSize() {
    const cc = this.options.chunk
    let size = ''
    size += cc.width ? `${cc.width}x` : `?x`
    size += cc.height ? `${cc.height}` : `?`
    if (size === '?x?') return 'auto'
    return size
  }

  get chunkflexibility() {
    const cc = this.options.chunk
    if (this.chunkSize === 'auto' && !cc.flexibility) return 'auto'
    return cc.flexibility ? cc.flexibility * 100 + '%' : 'none'
  }

  async run() {
    const sc = this.options.spritesheet
    const cc = this.options.chunk

    await Promise.all(this.imageSets.map(set => set.load())).catch(err => {
      errorLog('Loading', '', err)
      process.exit()
    })

    actionLog(
      'Grid will be generated ',
      '',
      `- spritesheet dimension: ${sc.width}x${sc.height}px\n` +
        `- chunk size: ${this.chunkSize}\n` +
        `- flexibility: ${
          cc.flexibility ? cc.flexibility * 100 + '%' : 'auto'
        }\n` +
        `- output path : ${this.directory}${this.name}.(png|json)\n`,
    )

    let grid = {
      chunks: [],
      anchorPoints: [{ x: 0, y: 0 }],
      width: sc.width,
      height: sc.height,
      totalPixel: 0,
      loss: 0,
      boundaries: { x: 0, y: 0 },
      sets: [],
    }
    console.log('Find best match')
    for (let i = 0; i < this.imageSets.length; i++) {
      grid = this.computeGrid(this.imageSets[i], grid, i)
    }

    if (!this.options.spritesheet.dimensionsForced) {
      while (
        grid.width / 2 > grid.boundaries.x &&
        grid.height / 2 > grid.boundaries.y
      ) {
        grid.width = grid.width / 2
        grid.height = grid.height / 2
      }
    }

    console.log()

    delete grid.anchorPoints

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
      grid.boundaries.x < grid.width * 0.75 &&
      grid.boundaries.y < grid.height * 0.75
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
// - crop / flexibility these image

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
