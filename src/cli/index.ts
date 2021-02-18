#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { Generator } from './generator'
import { ImageSet } from './image-set'
import { actionLog, errorLog } from './helpers/log'
import { getConfig } from './config'
import { helpCommand } from './help'
import { handleFsError } from './helpers/fs-error'

/**
 * Start
 */
actionLog('Process', 'start')
// eslint-disable-next-line
const args = require('yargs').argv
const startAt = Date.now()
const sets: ImageSet[] = []
const config = getConfig()

/**
 * Handle help command
 */
if (args.h || args.help) {
  helpCommand()
}

/**
 * Analyse input
 */
const EXTNAMES = ['.png', '.jpg', '.jpeg']
config.input.forEach(dirPath => {
  try {
    // Fetch content in directory
    const dirContent = fs.readdirSync(dirPath).filter(fileName => {
      return EXTNAMES.indexOf(path.extname(fileName)) >= 0
    })

    if (dirContent.length === 0) {
      errorLog(`No files found in path "${dirPath}"`)
      process.exit()
    }

    sets.push(
      new ImageSet({
        baseUrl: dirPath,
        paths: dirContent,
      }),
    )
  } catch (error) {
    handleFsError(error, dirPath)
  }
})

/**
 * Launch spritesheet generation
 */
;(async () => {
  const generator = new Generator({
    options: config,
    imageSets: sets,
  })

  await generator.run()
  const endAt = Date.now()
  actionLog('Time', (endAt - startAt) / 1000 + 's')
})()
