const docs = {
  options: {
    width: {
      description:
        'Width of the output spritesheet. If undefined, calculated automatically',
      type: 'number',
      default: 'auto',
      alias: '--w',
      multiple: false,
    },

    height: {
      description:
        'Height of the output spritesheet. If undefined, equal to width',
      type: 'number',
      default: 'auto',
      alias: '--h',
      multiple: false,
    },

    'chunk.width': {
      description: `Width of a chunk. If undefined, calculated to fit in spritesheet dimensions`,
      type: 'number',
      default: 'auto',
      alias: '--c.w',
      multiple: false,
    },

    'chunk.height': {
      description: `Represent the height of a chunk. See "chunk.width" behavior`,
      type: 'number',
      default: 'auto',
      alias: '--c.h',
      multiple: false,
    },

    flexibility: {
      description: `Intensity of resizing to fit inside spritesheet dimensions. Between 0 (no resize) and 1 (full resize).`,
      type: 'number',
      default: 1,
      alias: '',
      multiple: false,
    },

    input: {
      description: `The path to the folder where image sequence is stored`,
      type: 'string',
      default: null,
      alias: '',
      multiple: true,
    },

    output: {
      description: `The path to the folder where spritesheet will be created`,
      type: 'string',
      default: null,
      alias: '',
      multiple: false,
    },
  },
}

export default docs
export const helpCommand = () => {
  console.table(docs.options)
  process.exit()
}
