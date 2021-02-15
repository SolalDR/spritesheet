#!/usr/bin/env node

import { Generator } from "./generator"
import { ImageSet } from "./image-set"
import { CLIChunkConfig, CLISpritesheetConfig, CLIOutputConfig } from './interfaces'
import { actionLog, errorLog } from "./log"

const args = require('yargs').argv
const fs = require('fs')
const path = require('path')
const glob = require('glob')
actionLog('Process', 'start')
const EXTNAMES = ['.png', '.jpg', '.jpeg']

const chunkConfig: CLIChunkConfig = { ...args.c, ...args.chunk }
chunkConfig.width = chunkConfig.width || chunkConfig.w || null;
chunkConfig.height = chunkConfig.height || chunkConfig.h || null;
chunkConfig.resize = chunkConfig.resize || 0;
delete chunkConfig.h
delete chunkConfig.w


let spritesheetConfig: CLISpritesheetConfig = { ...args, ...args.s, ...args.spritesheet }
spritesheetConfig.width = spritesheetConfig.width || spritesheetConfig.w || 2048;
spritesheetConfig.height = spritesheetConfig.height || spritesheetConfig.h || spritesheetConfig.width;
spritesheetConfig = { width: spritesheetConfig.width, height: spritesheetConfig.height };

let outputConfig: CLIOutputConfig = { ...args, ...args.o, ...args.output }
if (!outputConfig.name) console.log('No output name was provided, using "spritesheet" by default')
outputConfig.name = outputConfig.name || 'spritesheet'
if (!args.o?.dir && !args.output?.dir) console.log('No output dir was provided, using current directory by default')
outputConfig.dir = args.o?.dir || args.output?.dir || '.'
outputConfig = { name: outputConfig.name, dir: outputConfig.dir }

// spritesheet -c.w=300 -c.h=1024 --w 4096 --dir /Users/solaldussout-revel/Developer/9P/ysl-proto-360/public/images/tenue
// spritesheet -c.w=300 -c.h=1024 --w 4096 --files /Users/solaldussout-revel/Developer/9P/ysl-proto-360/public/images/tenue/*.png

function handleFsError(error, path) {
  switch(error.errno) {
    case -2: errorLog('FileSystem', `Cannot read directory with path: "${path}"`)
  }
  process.exit()
}

const sets: ImageSet[] = [];

const dirsSet = args.dir ? args.dir instanceof Array || [String(args.dir)] : []
const globsSet = args.files ? args.files instanceof Array || [String(args.files)] : []

if (dirsSet instanceof Array) {
  dirsSet.forEach(dirPath => {
    try {
      const dirContent = fs.readdirSync(dirPath).filter(fileName => {
        return EXTNAMES.indexOf(path.extname(fileName)) >= 0
      })

      if (dirContent.length === 0) {
        errorLog(`No files found in path "${dirPath}"`)
        process.exit()
      }

      sets.push(new ImageSet({
        baseUrl: dirPath,
        paths: dirContent,
        chunk: {
          width: chunkConfig.width,
          height: chunkConfig.height
        }
      }));
    } catch(error) {
      handleFsError(error, dirPath)
    }
  })
}

if (globsSet instanceof Array) {
  globsSet.forEach(globPath => {
    const files = glob.sync(globPath, {
      nonull: true, nodir: true, stat: true, readdir: true
    })
    console.log(files);
  })
}

const generator = new Generator({
  width: spritesheetConfig.width,
  height: spritesheetConfig.height,
  output: outputConfig,
  imageSets: sets,
  chunkConfig
})

generator.run()
